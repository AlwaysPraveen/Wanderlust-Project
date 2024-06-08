const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js"); //To require wrapAsync file
const Listing = require("../models/listing.js");

const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer  = require('multer') // To require multer
const {storage} = require("../cloudConfig.js"); //To require storage from cloudConfig.js
const upload = multer({ storage }) // To set path for files

//This router.route is a shortcut method to comine routes that are having same path.(Here "/")
router.route("/")
.get( wrapAsync(listingController.index)) //("Index Route") we require index from listingController(../controllers/listings.js)
.post( isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing)); // Create Route (To create new list)


// New Route (Create List)
router.get("/new", isLoggedIn, listingController.renderNewForm); //we reuire renderNewFrom route from  listingController

router.route("/:id")
.get( wrapAsync(listingController.showListing)) // Show Route (To show individual data when we click on title)
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing)) //Update Route
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing)); //Delete Route


//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;