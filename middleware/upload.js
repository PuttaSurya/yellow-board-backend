const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/aws');

// Multer configuration for S3 storage
const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    acl: 'public-read',
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  })
});

// Export for array of images (adjust the limit as needed)
module.exports = {
  uploadS3: uploadS3.array('images', 5),  // Max 5 images
  uploadNone: multer() // For handling non-file form data
};
