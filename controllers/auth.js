const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/db');

// Register
exports.register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error creating user' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        }
    );
};

// Login
exports.login = (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, tokenType: 'access' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
};

// Recovery Password
exports.recoverPassword = (req, res) => {
    const { email } = req.body;
    
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Eliminando tokenType

    connection.query(
        'UPDATE users SET reset_token = ?, reset_token_expiry = NOW() + INTERVAL 1 HOUR WHERE email = ?',
        [resetToken, email],
        (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(500).json({ message: 'Error processing request' });
            }

            // Enviar el token de restablecimiento (simulación de envío)
            res.json({ message: `Password reset token generated. Use this token in reset URL: ${resetToken}` });
        }
    );
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    connection.query(
        'UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ? AND reset_token_expiry > NOW()',
        [hashedPassword, token],
        (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            res.json({ message: 'Password updated successfully' });
        }
    );
};
