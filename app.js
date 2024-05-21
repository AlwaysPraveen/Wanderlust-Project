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

const session = require("express-session"); //To require express-session package
const flash = require("connect-flash"); //To connect flash

const passport = require("passport"); //To require passport
const LocalStrategy = require("passport-local"); //To require passport-local strategy
const User = require("./models/user.js"); //To require userSchema

const listingRouter = require("./routes/listing.js"); // To require listing routes
const reviewRouter = require("./routes/review.js"); //To require review routes
const userRouter = require("./routes/user.js"); //To require user routes


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

const sessionOptions = { //these are the session options
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.get("/",(req,res) => {
    res.send("Root")
    console.log("root is working");
});

app.use(session(sessionOptions)); //we use those session options over here
app.use(flash()); // Using flash package here
//We use passport middleware just after the session ,bcoz we use session in passport
app.use(passport.initialize()); //This is the Middleware that initializes passport
app.use(passport.session()); //To use session in passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => { //This is the middleware to use flash throughout the project
    res.locals.success = req.flash("success"); //To store flash in entire project (locals)
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; //to use currUser in entire Project
    next();
});

// app.get("/demouser",async (req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student2",
//     });

//     let registeredUser = await User.register(fakeUser,"helloworld"); //This is passport static method. With this we can register the user
//                                                      // helloworld is password here
//     res.send(registeredUser);
// });                                                 


app.use("/listings",listingRouter); //In the place of listings route we use listingRouter

app.use("/listings/:id/reviews",reviewRouter); // In the place of /listings/:id/reviews route we are using reviewRouter

app.use("/",userRouter);

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