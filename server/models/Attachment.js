const { DataTypes } = require('sequelize');
const { sequelize, tableNames } = require('../config/db');
const Report = require('./Report');

const isPostgres = !!(process.env.DATABASE_URL);
const Attachment = sequelize.define('attachments', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false,
        field: isPostgres ? 'file_url' : 'url'
    },
    file_type: {
        type: DataTypes.STRING,
        field: isPostgres ? 'file_type' : 'mime_type'
    }
}, {
    tableName: tableNames.attachments,
    timestamps: true
});

// Relationships
Report.hasMany(Attachment, { foreignKey: 'report_id' });
Attachment.belongsTo(Report, { foreignKey: 'report_id' });

module.exports = Attachment;
