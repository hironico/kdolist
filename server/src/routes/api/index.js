const express = require('express');
const router = express.Router();
const { authApi } = require('./auth');
const { giftListApi } = require('./giftlist');
const { giftApi } = require('./gift');

router.get('/v1/ping', (req, res) => {
  res.status(200).send('pong');
});

router.use(authApi);
router.use(giftListApi);
router.use(giftApi);

module.exports = router;