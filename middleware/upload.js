const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/aws');

// Uploader for vehicle images
const uploadVehicleImages = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_VEHICLES,
    acl: 'public-read',
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  })
}).array('images', 5); 

// Uploader for spare part images
const uploadSpareImages = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_SPARES,
    acl: 'public-read',
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  })
}).array('images', 5); 

// For handling non-file fields only
const uploadNone = multer();

module.exports = {
  uploadVehicleImages,
  uploadSpareImages,
  uploadNone
};