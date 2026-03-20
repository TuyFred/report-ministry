const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { fullname, email, password, country, contact, address } = req.body;

        console.log('Registration attempt for email:', email);

        // Validate input
        if (!fullname || !email || !password || !country) {
            console.log('Missing required fields');
            return res.status(400).json({ msg: 'Please provide all required fields: fullname, email, password, country' });
        }

        // All new registrations are created as 'member' role
        // Admins can change user roles after registration
        const userRole = 'member';

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with member role (admins can upgrade role later)
        user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role: userRole,
            country,
            contact,
            address
        });

        console.log('User registered successfully:', email, 'as member (admin can change role later)');

        // Create token
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                country: user.country
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role, country: user.country, profile_image: user.profile_image } });
        });

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// Admin registration endpoint - for Postman/API use only
exports.registerAdmin = async (req, res) => {
    try {
        const { fullname, email, password, country, contact, address, adminSecret } = req.body;

        // Verify admin secret key (you should set this in .env)
        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ msg: 'Unauthorized: Invalid admin secret key' });
        }

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role: 'admin',
            country,
            contact,
            address
        });

        // Create token
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                country: user.country
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({
                msg: 'Admin account created successfully',
                token,
                user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role, country: user.country, profile_image: user.profile_image }
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for email:', email);

        // Validate input
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log('User found, checking password...');

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check if system is in maintenance mode
        const fs = require('fs');
        const path = require('path');
        const maintenanceFilePath = path.join(__dirname, '../maintenance.json');

        if (fs.existsSync(maintenanceFilePath)) {
            const data = fs.readFileSync(maintenanceFilePath, 'utf8');
            const maintenanceData = JSON.parse(data);

            // If maintenance is on and user is not admin, block login
            if (maintenanceData.isMaintenanceMode && user.role !== 'admin') {
                console.log('Login blocked during maintenance for non-admin:', email);
                return res.status(503).json({
                    msg: 'System is under maintenance. Only administrators can access.',
                    maintenanceMode: true
                });
            }
        }

        console.log('Login successful for user:', email);

        // Create token
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                country: user.country
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role, country: user.country, profile_image: user.profile_image } });
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Forgot Password - Send reset token
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ msg: 'User not found with this email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetTokenExpiry;
        await user.save();

        res.json({
            msg: 'Password reset token generated',
            resetToken,
            resetLink: `http://localhost:3001/reset-password/${resetToken}`
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({ where: { resetPasswordToken: token } });

        if (!user || new Date() > user.resetPasswordExpire) {
            return res.status(400).json({ msg: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();

        res.json({ msg: 'Password has been reset successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Change Password (for logged-in users)
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password changed successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create Admin (Protected: Admin only)
exports.createAdmin = async (req, res) => {
    try {
        // Check if requester is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to create admin accounts' });
        }

        const { fullname, email, password, country } = req.body;

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role: 'admin',
            country
        });

        res.json({ msg: 'Admin account created successfully', user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
