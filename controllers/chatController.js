const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('../services/awsS3Service');
const path = require('path');

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME || 'your-bucket-name',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'uploads/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
});

const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // req.file.location is populated by multer-s3 with the S3 URL
  res.json({ fileUrl: req.file.location });
};

module.exports = { upload, uploadFile };
