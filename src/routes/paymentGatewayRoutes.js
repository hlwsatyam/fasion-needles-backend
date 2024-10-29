const express = require('express');
const router = express.Router();
const payment = require('../controllers/paymentGateway.js');

router.get('/pay', payment.transectionStart);
router.get('/status', payment.handleStatus);

module.exports = router;
 