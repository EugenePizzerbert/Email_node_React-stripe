const passport = require("passport"),
  GoogleStrategy = require("passport-google-oauth20").Strategy,
  LocalStrategy = require("passport-local").Strategy,
  keys = require("../config/keys"),
  mongoose = require("mongoose"),
  bcrypt = require("bcrypt");

const User = mongoose.model("users");

// passport.use(new LocalStrategy({}));

//google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }).then(user => {
        if (user) {
          console.log("user found " + user);
          return done(null, user);
        } else {
          new User({
            googleId: profile.id,
            name: profile.displayName
          })
            .save()
            .then(user => {
              console.log("user saved " + user);
              return done(null, user);
            });
        }
      });
    }
  )
);
passport.use(
  new LocalStrategy(function(username, password, done) {
    console.log(username, password);
    User.findOne({ email: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        console.log("no user");
        return done(null, false, { message: "Incorrect username." });
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.log("password err" + err);
          return done(err);
        }
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password." });
        }
      });
    });
  })
);

// serialize Users
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});
