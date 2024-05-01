const express = require("express");
const app = express();

const mongoose = require('mongoose');
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const path = require("path");

const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js"); //To require wrapAsync file
const ExpressError = require("./utils/ExpressError.js"); // To require Express error
const { listingSchema ,reviewSchema } = require("./schema.js"); //To require JOI schema validation
const Review = require("./models/review.js"); // To require review schema

main().then(() => {
    console.log("connected");
}).catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
};

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));// to get id from url
app.use(methodOverride("_method")); // to use PUT request
app.engine('ejs', ejsMate); //To use ejs-mate
app.use(express.static(path.join(__dirname,"/public"))); //To use static files (css files)

app.get("/",(req,res) => {
    res.send("Root")
    console.log("root is working");
});

const validateListing = (req,res,next) => { //JOI Middleware function
    let {error} = listingSchema.validate(req.body);
    if(error) { //the error is stored in result.error (We used JOI package to handle validation error)
        let errMsg = error.details.map( (el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
};

const validateReview = (req,res,next) => { //JOI Middleware function
    let {error} = reviewSchema.validate(req.body);
    if(error) { //the error is stored in result.error (We used JOI package to handle validation error)
        let errMsg = error.details.map( (el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
};

//index route
app.get("/listings", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

// New Route (Create List)
app.get("/listings/new", (req,res) => { // if this route is created after /listings/:id route, it shows error.Bcoz browser thinks listings/new as listings/:id
    res.render("listings/new.ejs");
});

// Show Route (To show individual data when we click on title)
app.get("/listings/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews"); //populate is to show reviews
    res.render("listings/show.ejs", {listing});
}));

// Create Route (To create new list)
app.post("/listings",validateListing,
     wrapAsync(async(req,res,next) => { //Here we use this wrapAsync error handling method to handle any typt of error from server side(Schema validation errors)
        //let listing = req.body;
        //const newListing = new Listing(req.body); 
        // if(!req.body.listing) { If we send a post req through hoppscotch with empty data. This error handler works
        //     throw new ExpressError(400,"Send valid data for Listing");
        // }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        console.log(newListing);
        res.redirect("/listings");
    })
);

//Edit route
app.get("/listings/:id/edit", wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id",validateListing, wrapAsync(async(req,res) => {
    // if(!req.body.listing) { If we send a put req through hoppscotch with empty data. This error handler works
    //     throw new ExpressError(400,"Send valid data for Listing");
    // }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req,res) => {
    let {id} = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// Reviews
// Post reviews route

app.post("/listings/:id/reviews",validateReview, wrapAsync (async(req,res) => {
    let listing =  await Listing.findById(req.params.id); //with this we can find the listing to add review
    let newReview = new Review(req.body.review); //we are taking the review from input & store it newReview

    listing.reviews.push(newReview); //we are adding the review to listing

    await newReview.save(); //saving reviews
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Delete Reviews Route

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}}); //With the pull operator,in reviews array of a listing, the id that matches review Id will be deleted
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

// app.get("/testListing", async (req,res) => {
//     let sampleListing = new Listing({
//         title: "My Villa",
//         description: "This villa have beach view",
//         price: 2500,
//         location: "Vizag, AP",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfully tested");
// });

app.all("*", (req,res,next) => { //Here * Route means , Every route except the above routes
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next) => { //Middleware to handle error in add new listing page
    let {statusCode = 500,message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    //res.status(statusCode).send(message);
});

app.listen(8080,() => {
    console.log("server ls listening at 8080");
});