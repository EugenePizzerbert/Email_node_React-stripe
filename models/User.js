const mongoose = require("mongoose");

module.exports = mongoose.model("users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  credits: {
    type: Number,
    default: 0
  },
  googleId: String
});
