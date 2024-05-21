const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); //To require User Schema to add user
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req,res) => { //To render signup page 
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req,res) => { //After Submitting add the User to DB
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
}));

router.get("/login",(req,res) => { //To show login form
    res.render("users/login.ejs"); 
 });

 router.post("/login",saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/login' , failureFlash: true}),(req,res) => { //passport.authenticate() is a middleware & "local" is a strategy & "failureredirect" is to redirect login page when an error occurs
    req.flash("success","Welcome back to Wanderlust"); //       "failureFlash: true" means if the authentication failed to show some falsh message
    let redirectUrl = res.locals.redirectUrl || "/listings" //if there is a value in res.redirect.redirectUrl use that value,otherwise use "/listings"
    res.redirect(redirectUrl); //To redirect to the same page that user tries to access
});

router.get("/logout", (req,res,next) => {
    req.logout((err) => { //req.logout is passport function
        if(err) {
            return next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;