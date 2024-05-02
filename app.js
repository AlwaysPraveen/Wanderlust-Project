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

const listings = require("./routes/listing.js"); // To require listing routes
const reviews = require("./routes/review.js"); //To require review routes

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


app.use("/listings",listings); //In the place of listings route we use listings folder where routes are placed

app.use("/listings/:id/reviews",reviews); // In the place of /listings/:id/reviews route we are using reviews


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