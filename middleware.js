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