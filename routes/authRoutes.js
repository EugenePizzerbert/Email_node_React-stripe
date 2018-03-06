const passport = require("passport"),
  key = require("../config/keys");
const mongoose = require("mongoose"),
  stripe = require("stripe")(key.stripeKey),
  async = require("async"),
  crypto = require("crypto"),
  User = mongoose.model("users");
nodemailer = require("nodemailer");
path = require("path");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(key.sendGridKey);

module.exports = app => {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"]
    }),
    (req, res) => {
      res.send("user auth " + req.user);
      console.log("user" + req.user);
    }
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/"
    })
  );
  app.get("/api/user", (req, res) => {
    res.json(req.user);
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.json(req.user);
  });

  app.post("/api/payout", (req, res) => {
    if (!req.user) {
      res.status(401).send({ message: "Not authrized" });
      return;
    }
    console.log(`-----------Amount-------`, req.body.amount, req.body.token);

    //test runing
    // req.user.credits += req.body.amount / 100;
    // req.user.save();
    // res.json(req.user);

    // console.log(`charge`, charge);

    // Stripe charges
    stripe.charges.create(
      {
        amount: req.body.amount,
        currency: "usd",
        source: req.body.token, // obtained with Stripe.js
        description: "Charge number 2 for akbarj@gmail.com"
      },
      function(err, charge) {
        if (err) {
          console.log(err);
          return;
        } else {
          // asynchronously called
          console.log(`charge`, charge);
          req.user.credits += req.body.amount / 100;
          req.user.save();
          res.json(req.user);
        }
      }
    );
  });

  //email
  app.post("/api/servey", (req, res) => {
    const { title, subject, body, list } = req.body;
    console.log(list, subject);
    const msg = {
      to: list,
      from: "no_reply@bemail.com",
      subject: subject,
      html: "<div>" + body + "</div>"
    };
    sgMail.send(msg);
    res.status(200).send({ message: "email sent" });
  });
};

app.post("/api/register", (req, res) => {
  const user = new User();
  user.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;

  bcrypt.genSalt(10, (err, salt) => {
    if (err) console.log(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      user.save();
      res.status(200).send({ message: "User is Created" });
    });
  });
});

app.post("/api/forgot", function(req, res, next) {
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        console.log(req.body.email);
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            return res.send({
              message: "no email Found."
            });
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            res.send({
              message: "Password token sent."
            });
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "test",
            pass: "test"
          }
        });
        var mailOptions = {
          to: user.email,
          from: "passwordreset@themazsolution.com",
          subject: "Bmail Password Reset",
          html:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n"
        };
        // smtpTransport.sendMail(mailOptions, function(err) {
        sgMail.send(mailOptions, function(err) {
          done(err, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.status("/api/forgot");
    }
  );
});

// reset Password

app.post("/api/reset", function(req, res) {
  async.waterfall(
    [
      function(done) {
        User.findOne(
          {
            resetPasswordToken: req.body.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          function(err, user) {
            if (!user) {
              res.send({
                message: "Password reset token is invalid or has expired."
              });
              return;
            }

            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            console.log(user.password);
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                console.log(user.password);
                user.save(function(err) {
                  res.send({
                    message: "Password chaged."
                  });
                  done(err, user);
                });
              });
            });
          }
        );
      },

      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "test",
            pass: "test"
          }
        });
        var mailOptions = {
          to: user.email,
          from: "passwordreset@themazsolution.com",
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n"
        };
        sgMail.send(mailOptions, function(err) {});
      }
    ],
    function(err) {
      res.redirect("/");
    }
  );
});

//

let smtpConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: "username",
    pass: "password"
  }
};
app.post(
  "/api/login",
  passport.authenticate("local"),

  (req, res) => {

    res.send(req.user);
  }
);

app.get("/api/new", (req, res) => res.send("new"));
//test

// var servey ={
// title:"new servey",
// sebject:"this is the first servey",
// list:["akbarj@gmail.com","themazsolution@gmail.com"],
// body:"ok, I am the body"}
