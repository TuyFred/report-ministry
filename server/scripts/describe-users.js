const { sequelize } = require('../config/db');

(async () => {
  try {
    await sequelize.authenticate();
    const qi = sequelize.getQueryInterface();
    const desc = await qi.describeTable('users');
    console.log('users table description:');
    console.dir(desc, { depth: null });
    process.exit(0);
  } catch (err) {
    console.error('Describe failed:', err.message || err);
    process.exit(1);
  }
})();
