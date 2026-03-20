const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ReportFormTemplate = sequelize.define('ReportFormTemplate', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    definition: {
        // Use generic JSON for MySQL compatibility
        type: DataTypes.JSON,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = ReportFormTemplate;
