const { sequelize } = require('../config/db');

// Ensure models are loaded so sequelize knows about them
require('../models/User');
require('../models/Report');
require('../models/Attachment');
require('../models/ReportFormTemplate');

(async () => {
  try {
    console.log('Starting DB sync (alter=true). This will add missing tables/columns.');
    await sequelize.sync({ alter: true });
    console.log('DB sync complete');
    process.exit(0);
  } catch (err) {
    console.error('DB sync failed:', err);
    process.exit(1);
  }
})();
