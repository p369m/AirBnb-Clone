const express = require("express");
const mongoose = require("mongoose");
const app = express();

const reviewSchema = mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// const Review =
module.exports = mongoose.model("Review", reviewSchema);
