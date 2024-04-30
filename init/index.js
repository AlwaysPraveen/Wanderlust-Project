const mongoose = require("mongoose");

const initData = require("./data.js");

const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


main().then(() => {
    console.log("connected");
}).catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data); //here data we get from data.js is in the form of object.We are accessing the data key in initdata
    console.log("data was initialized");
};

initDB();