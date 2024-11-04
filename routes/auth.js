const express = require('express');
const { register, login, recoverPassword, resetPassword } = require('../controllers/auth');
const { authenticateToken, verifyRecoveryToken } = require('../middleware/auth'); // Asegúrate de importar ambas funciones
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/recovery', recoverPassword);
router.post('/reset/:token', resetPassword);

// Ruta para verificar el token de recuperación
router.post('/verify-token', verifyRecoveryToken, (req, res) => {
    res.json({ message: 'Recovery token is valid', user: req.user });
});

module.exports = router;
