const Review = require("../models/review.js"); // To require review schema
const Listing = require("../models/listing.js");

module.exports.createReview = async(req,res) => { // / we are making this as "/"
    let listing =  await Listing.findById(req.params.id); //with this we can find the listing to add review
    let newReview = new Review(req.body.review); //we are taking the review from input & store it newReview
    newReview.author = req.user._id; //The author must be the current user
    console.log(newReview);
    listing.reviews.push(newReview); //we are adding the review to listing
    await newReview.save(); //saving reviews
    await listing.save();
    req.flash("success", "New Review Created");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async(req,res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}}); //With the pull operator,in reviews array of a listing, the id that matches review Id will be deleted
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
}