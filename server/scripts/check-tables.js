const { sequelize } = require('../config/db');

(async () => {
  try {
    const qi = sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    console.log('Tables in database:', tables);

    // Try a safe select on ReportFormTemplate
    try {
      const [results] = await sequelize.query('SELECT COUNT(*) as cnt FROM `ReportFormTemplate`');
      console.log('ReportFormTemplate count:', results[0].cnt);
    } catch (err) {
      console.error('Select failed for ReportFormTemplate:', err.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to list tables:', err);
    process.exit(1);
  }
})();
