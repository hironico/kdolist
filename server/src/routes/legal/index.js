const express = require('express');
const router = express.Router();
const { privacyApi } = require('./privacy');

router.use(privacyApi);

module.exports = router;