const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Report = sequelize.define('reports', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    church: {
        type: DataTypes.STRING,
        allowNull: false
    },
    evangelism_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    people_reached: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    contacts_received: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bible_study_sessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bible_study_attendants: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    unique_attendants: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    newcomers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    meditation_time: {
        type: DataTypes.FLOAT, // stored in hours
        defaultValue: 0
    },
    prayer_time: {
        type: DataTypes.FLOAT, // stored in hours
        defaultValue: 0
    },
    morning_service: {
        type: DataTypes.STRING
    },
    regular_service: {
        type: DataTypes.STRING
    },
    sermons_listened: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    articles_written: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    exercise_time: {
        type: DataTypes.FLOAT, // stored in hours
        defaultValue: 0
    },
    sermon_reflection: {
        type: DataTypes.TEXT
    },
    reflections: {
        type: DataTypes.TEXT
    },
    thanksgiving: {
        type: DataTypes.TEXT
    },
    repentance: {
        type: DataTypes.TEXT
    },
    prayer_requests: {
        type: DataTypes.TEXT
    },
    other_work: {
        type: DataTypes.TEXT
    },
    tomorrow_tasks: {
        type: DataTypes.TEXT
    },
    other_activities: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true
});

// Relationships
User.hasMany(Report, { foreignKey: 'user_id' });
Report.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Report;
