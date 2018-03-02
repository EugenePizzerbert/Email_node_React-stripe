const mongoose = require("mongoose");

module.exports = mongoose.model("servey", {
  title: String,
  subject: String,
  body: String,
  list: [String]
});
