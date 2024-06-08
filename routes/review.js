const express = require("express");
const router = express.Router({mergeParams: true});

const wrapAsync = require("../utils/wrapAsync.js"); //To require wrapAsync file
const ExpressError = require("../utils/ExpressError.js"); // To require Express error

const Review = require("../models/review.js"); // To require review schema
const Listing = require("../models/listing.js");
const {validateReview,isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


// Reviews
// Post reviews route

router.post("/",isLoggedIn,validateReview, wrapAsync (reviewController.createReview));

//Delete Reviews Route

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;