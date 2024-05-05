require("dotenv").config();
// console.log(process.env.NAME);

const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listings = require("./router/listing.js");
const { isLoggedIn, saveRedirectUrl } = require("./middleware.js");

const app = express();
app.set("view engine", "ejs");

main()
  .then(() => {
    console.log("Connected To DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlast");
}

app.listen(8080, () => {
  console.log("SERVER Starts listening on Port 8080");
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser("123"));
const sessionOptions = {
  secret: "7001356148",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1 * 24 * 60 * 60 * 1000,
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());
app.engine("ejs", ejsMate);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => {
  console.dir(req.cookies);
  res.send("This is ROOT");
});

app.use("/listings", listings);

app.get("/greeting", (req, res) => {
  let { name = "Boss" } = req.signedCookies;
  res.send(`Good Eve, Mr. ${name}`);
});

app.get("/cookies", (req, res) => {
  res.cookie("name", "BOSS", { signed: true });
  res.send("See Cookie");
});

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "parthamandal621@gmail.com",
    username: "pm369",
  });
  let ns = await User.register(fakeUser, "123");
  res.send(ns);
});

app.get("/signup", (req, res) => {
  req.flash("msg", "Welcome! Account Created");
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  let { username, email, password } = req.body;
  let newUser = new User({ username, email });
  let regUser = await User.register(newUser, password);
  req.login(regUser, (err) => {
    if (err) {
      return next(err);
    }
    req.flash("msg", "WelcOme Bro");
    res.redirect("/listings");
  });
});

app.get("/login", (req, res) => {
  res.locals.msg = req.flash("msg");
  // console.log(res.locals.redirectUrl);
  res.render("login");
});

app.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    // res.locals.msg=req.flash("msg");
    req.flash("msg", "Welcome Back! LogIn Succesful");
    // console.log(res.locals.redirectUrl);
    let url = res.locals.redirectUrl || "/listings";
    res.redirect(url);
  }
);

app.get("/logout", isLoggedIn, (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
  });
  req.flash("msg", "You're Logged out successfully !");
  res.redirect("/listings");
});
