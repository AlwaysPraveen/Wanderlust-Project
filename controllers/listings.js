const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); //Required geocoding service
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken}); // We start the geocode service of mapbox

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) => { // if this route is created after /listings/:id route, it shows error.Bcoz browser thinks listings/new as listings/:id
    
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({ path:"reviews",populate:{path: "author"},}).populate("owner"); //populate is to show reviews
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async(req,res,next) => { //Here we use this wrapAsync error handling method to handle any typt of error from server side(Schema validation errors)
    //let listing = req.body;
    //const newListing = new Listing(req.body); 
    // if(!req.body.listing) { If we send a post req through hoppscotch with empty data. This error handler works
    //     throw new ExpressError(400,"Send valid data for Listing");
    // }
    let response = await geocodingClient //copied from mapbox github (To convert location name to geometric coordinates)
     .forwardGeocode({
        query: req.body.listing.location,
        limit: 1 //Limit for location
      })
     .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; //We are adding owner with current user that loggedin
    newListing.image = {url,filename}; // adding url and filename with the image
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250"); // To decrease size of the preview image
    res.render("listings/edit.ejs", {listing, originalImageUrl });
};

module.exports.updateListing = async(req,res) => {
    // if(!req.body.listing) { If we send a put req through hoppscotch with empty data. This error handler works
    //     throw new ExpressError(400,"Send valid data for Listing");
    // }
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing}); // We update every detail normally here,But we can not update file here
    if( typeof req.file !== "undefined"){ //If req.file exists then only we perform below operation (Becoz in edit page we don't need to add image compulsory,we can use previous image also)
        let url = req.file.path;
        let filename = req.file.filename; //we get path&filename from here
        listing.image = {url,filename} //we push the path & filename to listing image
        await listing.save(); //next we save the listing that contains new image
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res) => {
    let {id} = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};