const { sequelize } = require('../config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.query('ALTER TABLE `attachments` MODIFY `report_id` INT(11) NULL;');
    console.log('attachments.report_id altered to NULL');
    process.exit(0);
  } catch (err) {
    console.error('Alter failed:', err.message || err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
