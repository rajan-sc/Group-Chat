const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { autocomplete, smartReply } = require('../controllers/aiController');

router.post('/autocomplete', authenticate, autocomplete);
router.post('/reply', authenticate, smartReply);

module.exports = router;
