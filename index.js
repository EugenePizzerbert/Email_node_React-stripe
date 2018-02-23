const express = require('express'),
mongoose = require('mongoose'),
passport = require('passport'),
cookieSession = require('cookie-session'),

keys = require('./config/keys'),
 
app = express();

mongoose.connect(keys.mongoURI, ()=>console.log('db is connected'))
require('./models/User')
require('./services/passport')

app.use(cookieSession({
  keys:[keys.cookieKey],
  maxAge: 24 * 60 * 60 * 1000
}))
app.use(passport.initialize())
app.use(passport.session())

//Routes
require('./routes/authRoutes')(app)
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
  console.log('listening on 5000')
})
