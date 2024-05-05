const express = require("express");
const mongoose = require("mongoose");
// const Listing = require("./models/listing");
// const Review = require("./models/review");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
app.set("view engine", "ejs");

const sessionOptions = {
  secret: "7001356148",
  resave: false,
  saveUninitialized: true,
};
app.use(session(sessionOptions));
app.use(flash());
app.listen(8080, () => {
  console.log("server started");
});

app.get("/test", (req, res) => {
  res.send("Test Successful");
});

app.get("/reqcount", (req, res) => {
  if (req.session.count) {
    req.session.count += 1;
  } else {
    req.session.count = 1;
  }

  res.send(`You Sent req ${req.session.count} times`);
});

app.get("/register", (req, res) => {
  let { name } = req.query;
  req.session.name = name;
  //   res.send(`Welcome ${name}`);
  req.flash("success", "Your Registration is successful");
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.locals.msg = req.flash("success");
  //   res.render("page", { name: req.session.name, msg: req.flash("success") });
  res.render("page", { name: req.session.name });
});
