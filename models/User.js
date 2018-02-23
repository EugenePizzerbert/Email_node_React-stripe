const mongoose = require('mongoose');

module.exports = mongoose.model('users', {
  googleId:String
})
