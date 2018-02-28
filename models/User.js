const mongoose = require("mongoose");

module.exports = mongoose.model("users", {
  googleId: String,
  credits: {
    type: Number,
    default: 0
  }
});
