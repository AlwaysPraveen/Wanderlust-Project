const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js"); //To require wrapAsync file
const Listing = require("../models/listing.js");

const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");


//index route
router.get("/", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

// New Route (Create List)
router.get("/new", isLoggedIn, (req,res) => { // if this route is created after /listings/:id route, it shows error.Bcoz browser thinks listings/new as listings/:id
    
    res.render("listings/new.ejs");
});

// Show Route (To show individual data when we click on title)
router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner"); //populate is to show reviews
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));

// Create Route (To create new list)
router.post("/",isLoggedIn,validateListing,
     wrapAsync(async(req,res,next) => { //Here we use this wrapAsync error handling method to handle any typt of error from server side(Schema validation errors)
        //let listing = req.body;
        //const newListing = new Listing(req.body); 
        // if(!req.body.listing) { If we send a post req through hoppscotch with empty data. This error handler works
        //     throw new ExpressError(400,"Send valid data for Listing");
        // }
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id; //We are adding owner with current user that loggedin
        await newListing.save();
        req.flash("success","New Listing Created");
        res.redirect("/listings");
    })
);

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
router.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(async(req,res) => {
    // if(!req.body.listing) { If we send a put req through hoppscotch with empty data. This error handler works
    //     throw new ExpressError(400,"Send valid data for Listing");
    // }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async(req,res) => {
    let {id} = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}));

module.exports = router;