const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { upload, uploadFile } = require('../controllers/chatController');

router.post('/upload', authenticate, upload.single('file'), uploadFile);

module.exports = router;
