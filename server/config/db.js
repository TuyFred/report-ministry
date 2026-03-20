const { Sequelize } = require('sequelize');

// Support both DATABASE_URL (for Render) and individual credentials (for local)
let sequelize;

if (process.env.DATABASE_URL) {
    // Production: Use DATABASE_URL from Render
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: process.env.DB_DIALECT || 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Local: Use individual DB credentials (supports MySQL and PostgreSQL)
    const dbDialect = process.env.DB_DIALECT || 'mysql';
    const dialectOptions = dbDialect === 'mysql' ? {
        // MySQL specific options
        connectTimeout: 10000
    } : {};

    sequelize = new Sequelize(
        process.env.DB_NAME || 'report',
        process.env.DB_USER || 'root',
        process.env.DB_PASS || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || (dbDialect === 'mysql' ? 3306 : 5432),
            dialect: dbDialect,
            logging: false,
            dialectOptions: dialectOptions,
            define: {
                // Force lowercase table names to match MySQL schema
                freezeTableName: true,
                underscored: false,
                timestamps: true
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        const dbType = process.env.DATABASE_URL ? 'Production (Render)' : 'Local';
        const dialect = sequelize.options.dialect.toUpperCase();
        const dbName = sequelize.config.database;
        console.log(`${dialect} Connected (${dbType}) - Database: ${dbName}`);
        
        // Skip auto-sync - we're using manual MySQL schema
        // await sequelize.sync({ alter: true });
        console.log('Database Ready (using manual schema)');
    } catch (err) {
        console.error('Unable to connect to database:', err.message);
        console.error('Full error:', err);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
