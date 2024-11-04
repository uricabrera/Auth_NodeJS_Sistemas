const jwt = require('jsonwebtoken');

// Middleware para autenticar el token de acceso
exports.authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Información del usuario
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid access token' });
    }
};

// Middleware para verificar la validez del token de recuperación
exports.verifyRecoveryToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Información del token de recuperación
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired recovery token' });
    }
};
