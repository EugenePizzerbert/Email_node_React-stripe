const mongoose = require("mongoose");

module.exports = mongoose.model("google", {
  googleId: String,
  credits: {
    type: Number,
    default: 0
  }
});
