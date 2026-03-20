const User = require('../models/User');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Create a new user (Admin creates Leader, Leader creates Member)
exports.createUser = async (req, res) => {
    try {
        const { fullname, email, password, role, country, contact, address } = req.body;
        const requestingUser = req.user;

        // Authorization checks
        if (requestingUser.role === 'admin') {
            // Admin can create any role, including other admins
        } else if (requestingUser.role === 'leader') {
            if (!['member', 'leader'].includes(role)) {
                return res.status(403).json({ msg: 'Leaders can only create members or leaders' });
            }
            if (country !== requestingUser.country) {
                return res.status(403).json({ msg: 'Cannot create users in another country' });
            }

            // Keep the leader-per-country limit consistent
            if (role === 'leader') {
                const leaderCount = await User.count({
                    where: {
                        role: 'leader',
                        country: requestingUser.country
                    }
                });

                if (leaderCount >= 2) {
                    return res.status(400).json({
                        msg: `Cannot assign more leaders. ${requestingUser.country} already has 2 leaders. Please remove an existing leader first.`
                    });
                }
            }
        } else {
            return res.status(403).json({ msg: 'Not authorized to create users' });
        }

        // Extra safety: leaders should never be able to create admins
        if (requestingUser.role !== 'admin' && role === 'admin') {
            return res.status(403).json({ msg: 'Not authorized to create admins' });
        }

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role,
            country,
            contact,
            address
        });

        res.json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all users (Admin sees all, Leader sees own country)
exports.getUsers = async (req, res) => {
    try {
        const requestingUser = req.user;
        let whereClause = {};

        if (requestingUser.role === 'leader') {
            // Leader sees all members in their country (including other leaders)
            whereClause.country = requestingUser.country;
            // Leaders should not see admins
            whereClause.role = { [Op.ne]: 'admin' };
        } else if (requestingUser.role === 'member') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] }
        });
        res.json(users);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const requestingUser = req.user;

        if (requestingUser.role === 'admin') {
            // Admin can delete anyone except other admins (if any)
        } else if (requestingUser.role === 'leader') {
            if (user.country !== requestingUser.country || user.role !== 'member') {
                return res.status(403).json({ msg: 'Not authorized' });
            }
        } else {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await user.destroy();
        res.json({ msg: 'User removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Profile Image
exports.updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Store a stable URL path (independent of server working directory)
        const imagePath = `uploads/${req.file.filename}`;

        user.profile_image = imagePath;
        await user.save();

        res.json({ 
            msg: 'Profile image updated', 
            profile_image: imagePath 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update User
exports.updateUser = async (req, res) => {
    try {
        const { fullname, email, role, country, contact, address } = req.body;
        const user = await User.findByPk(req.params.id);
        
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const requestingUser = req.user;

        // Authorization
        if (requestingUser.role === 'admin') {
            // Admin can update anyone
            
            // If admin is changing role to 'leader', check country leader limit
            if (role === 'leader' && user.role !== 'leader') {
                const targetCountry = country || user.country;
                const leaderCount = await User.count({
                    where: {
                        role: 'leader',
                        country: targetCountry
                    }
                });
                
                if (leaderCount >= 2) {
                    return res.status(400).json({ 
                        msg: `Cannot assign more leaders. ${targetCountry} already has 2 leaders. Please remove an existing leader first.` 
                    });
                }
            }
        } else if (requestingUser.role === 'leader') {
            // Leader can only update their country's members
            if (user.country !== requestingUser.country || user.role !== 'member') {
                return res.status(403).json({ msg: 'Not authorized' });
            }
            // Leader cannot change role or country
            if (role && role !== 'member') return res.status(403).json({ msg: 'Cannot change role' });
            if (country && country !== requestingUser.country) return res.status(403).json({ msg: 'Cannot change country' });
        } else {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        if (requestingUser.role === 'admin') {
            user.role = role || user.role;
            user.country = country || user.country;
        }
        user.contact = contact || user.contact;
        user.address = address || user.address;

        await user.save();
        res.json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin reset user password
exports.adminResetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const requestingUser = req.user;

        // Only admin can reset passwords
        if (requestingUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized. Only admins can reset passwords.' });
        }

        if (!userId || !newPassword) {
            return res.status(400).json({ msg: 'User ID and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ msg: `Password reset successfully for ${user.fullname}` });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
