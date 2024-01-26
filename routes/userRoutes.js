const express = require('express');
const router = express.Router();
const URL = require('../controllers/urls')

router.get('/', URL.home);
router.post('/short', URL.short);
router.get('/:short', URL.shortLink);


module.exports = router;