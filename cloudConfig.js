const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ //Means Mixing Cloudinary with backend
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET, //Here cloud_name, api_key, api_secret are constant we should not change them
})

const storage = new CloudinaryStorage({  // defining storage to save the files
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowerdFormats: ["png","jpg","jpeg"] // supports promises as well
    },
});

module.exports = {
    cloudinary,
    storage
}

