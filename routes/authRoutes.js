const passport = require("passport"),
  key = require("../config/keys");
(stripe = require("stripe")(key.stripeKey)), (path = require("path"));
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

// var servey ={
// title:"new servey",
// sebject:"this is the first servey",
// list:["akbarj@gmail.com","themazsolution@gmail.com"],
// body:"ok, I am the body"}
