const User = require("../models/user.js");

module.exports.renderSignupForm = (req,res) => { //To render signup page 
    res.render("users/signup.ejs");
};

module.exports.signup = async (req,res) => { //After Submitting add the User to DB
    try{
        let {username,email,password} = req.body;
        const newUser = new User({username,email});
        const registeredUser = await User.register(newUser,password);
        req.login(registeredUser, (err) => { //To Login the user automatically after signup
            if(err) {
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust");
            res.redirect("/listings");
        });
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => { //To show login form
    res.render("users/login.ejs"); 
 };

 module.exports.login = async (req,res) => { //passport.authenticate() is a middleware & "local" is a strategy & "failureredirect" is to redirect login page when an error occurs
    req.flash("success","Welcome back to Wanderlust"); //       "failureFlash: true" means if the authentication failed to show some falsh message
    let redirectUrl = res.locals.redirectUrl || "/listings" //if there is a value in res.redirect.redirectUrl use that value,otherwise use "/listings"
    res.redirect(redirectUrl); //To redirect to the same page that user tries to access
};

module.exports.logout = (req,res,next) => {
    req.logout((err) => { //req.logout is passport function
        if(err) {
            return next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    });
};