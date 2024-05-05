const Listing = require("./models/listing");
const Review = require("./models/review");
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    // console.log(req.session.redirectUrl);
    req.flash("msg", "Login first to Add new Listing");
    return res.redirect("/login");
  }

  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    // console.log(res.locals.redirectUrl);
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let list = await Listing.findById(id);
  if (list.owner.equals(req.user._id)) {
    let data = await Listing.findByIdAndUpdate(id, req.body.data);
    res.redirect(`/listings/${id}`);
  } else {
    res.send("You Are Not Authorizes User to do This");
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("msg", "Your Are not AUthor of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
