const passport = require('passport'),
GoogleStrategy = require('passport-google-oauth20').Strategy,
keys = require('../config/keys'),
mongoose = require('mongoose');

const User = mongoose.model('users');

passport.serializeUser((user, done)=>
{
  done(null, user.id)
})

passport.deserializeUser((id, done)=>
{
  User.findById(id, (err,user)=>done(err, user))
})

passport.use(new GoogleStrategy(
  {
    clientID:keys.googleClientID,
    clientSecret:keys .googleClientSecret,
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done)=>{
   User.findOne({googleId: profile.id}).then(
     user=>{
       if (user){
         console.log('user found '+ user)
         return done(null, user)
       }
       else{
         new User({googleId:profile.id}).save().then(
           user=>
           {console.log('user saved '+ user)
           return done(null, user)}
         )
       }
     }
   )
  }
))
