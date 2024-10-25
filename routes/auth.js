const express = require('express');
const { register, login, recoverPassword, resetPassword } = require('../controllers/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/recovery', recoverPassword);
router.post('/reset/:token', resetPassword);

module.exports = router;
