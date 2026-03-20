const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync models to ensure tables exist
        await sequelize.sync();

        const email = 'olvet@gmail.com';
        const password = 'olvet123';
        const fullname = 'Admin Olvet';

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('User already exists. Updating to admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            existingUser.password = hashedPassword;
            existingUser.role = 'admin';
            existingUser.fullname = fullname;
            await existingUser.save();
            console.log('User updated to Admin.');
        } else {
            console.log('Creating new admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                fullname,
                email,
                password: hashedPassword,
                role: 'admin',
                country: 'Global',
                contact: '0000000000',
                address: 'Admin Address'
            });
            console.log('Admin user created.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
