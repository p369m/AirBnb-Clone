const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");
main()
  .then(() => {
    console.log("Connected To DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlast");
}
const init = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "65a2a50a86f924aff51fe431",
  }));
  await Listing.insertMany(initData.data);
  console.log("DATA Insertion Successful");
};
// init();
