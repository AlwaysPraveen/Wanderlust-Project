const express = require("express");
const router = express.Router({mergeParams: true});

const wrapAsync = require("../utils/wrapAsync.js"); //To require wrapAsync file
const ExpressError = require("../utils/ExpressError.js"); // To require Express error
const { listingSchema ,reviewSchema } = require("../schema.js"); //To require JOI schema validation
const Review = require("../models/review.js"); // To require review schema
const Listing = require("../models/listing.js");

const validateReview = (req,res,next) => { //JOI Middleware function
    let {error} = reviewSchema.validate(req.body);
    if(error) { //the error is stored in result.error (We used JOI package to handle validation error)
        let errMsg = error.details.map( (el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
};

// Reviews
// Post reviews route

router.post("/",validateReview, wrapAsync (async(req,res) => { // / we are making this as "/"
    let listing =  await Listing.findById(req.params.id); //with this we can find the listing to add review
    let newReview = new Review(req.body.review); //we are taking the review from input & store it newReview

    listing.reviews.push(newReview); //we are adding the review to listing

    await newReview.save(); //saving reviews
    await listing.save();
    req.flash("success", "New Review Created");
    res.redirect(`/listings/${listing._id}`);
}));

//Delete Reviews Route

router.delete("/:reviewId", wrapAsync(async(req,res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}}); //With the pull operator,in reviews array of a listing, the id that matches review Id will be deleted
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;