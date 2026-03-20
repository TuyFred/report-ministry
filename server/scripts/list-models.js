const { sequelize } = require('../config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    console.log('Registered models:');
    console.log(Object.keys(sequelize.models));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
