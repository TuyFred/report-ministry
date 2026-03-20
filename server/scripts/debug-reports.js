const Report = require('../models/Report');
const User = require('../models/User');
const Attachment = require('../models/Attachment');
const { sequelize } = require('../config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const reports = await Report.findAll({
      include: [
        { model: User, attributes: ['fullname', 'country', 'contact'] },
        { model: Attachment }
      ],
      order: [['date', 'DESC']],
      limit: 5
    });

    console.log('Fetched reports:', reports.length);
    reports.forEach(r => console.log('Report id:', r.id, 'date:', r.date));
    process.exit(0);
  } catch (err) {
    console.error('Debug reports error:');
    console.error(err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
