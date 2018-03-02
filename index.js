const express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  cookieSession = require("cookie-session"),
  bodyParser = require("body-parser"),
  keys = require("./config/keys"),
  path = require("path")

app = express();

app.use(bodyParser.json());
mongoose.connect(keys.mongoURI, () => console.log("db is connected"));

require("./models/User");
require("./services/passport");

// middleware
app.use(
  cookieSession({
    keys: [keys.cookieKey],
    maxAge: 24 * 60 * 60 * 1000
  })
);
app.use(passport.initialize());
app.use(passport.session());

//Routes
require("./routes/authRoutes")(app);

app.use(express.static(path.join(__dirname, "build")));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(PORT, () => {
  console.log("listening on 5000");
});
