const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js"); // To require Express error
const { listingSchema ,reviewSchema } = require("./schema.js"); //To require JOI schema validation

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) { //To cheack wheather a user is logged in or not
        req.session.redirectUrl = req.originalUrl; //to redirect the same page that user tries to access (if user try to add new listing before login,we tell user to login.After the user logged in we redirect to the add new listing page automatically)
                                    //req.originalUrl stores the exact location of the url that user try to access before login
        req.flash("error","You must logged in to create a new Listing");
        return res.redirect("/login");
    }
    next();
};

//By default if a user logged into the page ,PAsssport automatically deletes everything in req Object
//To overcome this problem we save above req.originalUrl in locals . So we canaccess them throughout the project
//The below is the middleware to store the req.session.redirectUrl in locals

module.exports.saveRedirectUrl = (req,res,next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

//The below middleware is used to know wheather current user is the owner of the listing or not

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(! listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//The below middleware is to validate listing

module.exports.validateListing = (req,res,next) => { //JOI Middleware function
    let {error} = listingSchema.validate(req.body);
    if(error) { //the error is stored in result.error (We used JOI package to handle validation error)
        let errMsg = error.details.map( (el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
};

//The below middleware is to validate reviews

module.exports.validateReview = (req,res,next) => { //JOI Middleware function
    let {error} = reviewSchema.validate(req.body);
    if(error) { //the error is stored in result.error (We used JOI package to handle validation error)
        let errMsg = error.details.map( (el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
};
