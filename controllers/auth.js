const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/db');
const crypto = require('crypto');

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

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
};

// Recovery Password
exports.recoverPassword = (req, res) => {
    const { email } = req.body;
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    connection.query(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
        [resetToken, resetTokenExpiry, email],
        (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(500).json({ message: 'Error processing request' });
            }

            // Send email with reset link (skipping actual email sending)
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
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ? AND reset_token_expiry > NOW()',
        [hashedPassword, token],
        (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            res.json({ message: 'Password updated successfully' });
        }
    );
};
