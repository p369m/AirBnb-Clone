const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    // type: String,
    // default:
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS55oNpxRljZLcfloVmOmmzXiEgvRvYRSfQww&usqp=CAU",
    // set: (v) =>
    //   v === ""
    //     ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS55oNpxRljZLcfloVmOmmzXiEgvRvYRSfQww&usqp=CAU"
    //     : v,
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  review: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    let res = await Review.deleteMany({ _id: { $in: listing.review } });
    // console.log(res);
    // console.log("post");
  }
  // await Review.deleteMany({ _id: { $in: Listing.review } });
});
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
