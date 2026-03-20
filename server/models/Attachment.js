const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Report = require('./Report');

const Attachment = sequelize.define('attachments', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Map model attributes to existing DB column names
    file_url: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'url'
    },
    file_type: {
        type: DataTypes.STRING,
        field: 'mime_type'
    }
}, {
    timestamps: true
});

// Relationships
Report.hasMany(Attachment, { foreignKey: 'report_id' });
Attachment.belongsTo(Report, { foreignKey: 'report_id' });

module.exports = Attachment;
