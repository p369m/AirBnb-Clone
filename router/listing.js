const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn, isOwner, isAuthor } = require("../middleware.js");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const app = express();
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
// app.use(flash());
// app.engine("ejs", ejsMate);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});
router.get("/", async (req, res) => {
  let data = await Listing.find({}).populate("review");
  res.locals.msg = req.flash("msg");
  console.log(req.user);
  res.render("index", { data });
});
router.get("/new", isLoggedIn, (req, res) => {
  res.render("new");
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;
  let data = await Listing.findById(id)
    .populate({ path: "review", populate: { path: "author" } })

    .populate("owner");
  res.locals.msg = req.flash("msg");
  res.render("show", { data });
});

router.post("/", isLoggedIn, upload.single("data[image]"), (req, res) => {
  let newListing = new Listing(req.body.data);
  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(url, filename);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  // console.log(newListing);
  req.flash("msg", "New Listing added!");
  newListing
    .save()
    .then(() => {
      res.redirect("/listings");
    })
    .catch((err) => {
      console.log(err);
    });
  // res.send(req.file);
});

router.get("/:id/edit", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  let data = await Listing.findById(id);
  res.render("edit", { data });
});

router.put("/:id", isLoggedIn, async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndUpdate(id, req.body.data);
  res.redirect(`/listings/${id}`);
});

router.delete("/:id", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  let data = await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

router.post("/:id/review", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  let list = await Listing.findById(id);
  // console.log(req.body.review);

  let newReview = new Review(req.body.review);
  // console.log(newReview);

  list.review.push(newReview);
  newReview.author = req.user._id;
  await newReview.save();
  await list.save();
  // console.log(list);
  res.redirect(`/listings/${id}`);
});

router.delete(
  "/:id/review/:reviewId",
  isLoggedIn,
  isAuthor,
  async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  }
);

module.exports = router;
