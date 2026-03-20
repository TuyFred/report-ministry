require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');
const Report = require('./models/Report');
const Attachment = require('./models/Attachment');

async function testFullSystem() {
    console.log('