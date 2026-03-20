require('dotenv').config();
const { Sequelize } = require('sequelize');

// Test MySQL connection
async function testConnection() {
    console.log('Testing MySQL Connection...');
    console.log('----------------------------');
    console.log(`Database: ${process.env.DB_NAME || 'report'}`);
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Port: ${process.env.DB_PORT || '3306'}`);
    console.log(`User: ${process.env.DB_USER || 'root'}`);
    console.log('----------------------------\n');

    try {
        const sequelize = new Sequelize(
            process.env.DB_NAME || 'report',
            process.env.DB_USER || 'root',
            process.env.DB_PASS || '',
            {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                dialect: 'mysql',
                logging: console.log, // Show SQL queries
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            }
        );

        // Test authentication
        await sequelize.authenticate();
        console.log('✓ MySQL Connection Successful!');
        console.log('✓ Database "report" is accessible\n');

        // Test query to show tables
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('Existing tables in database:');
        if (tables.length === 0) {
            console.log('  (No tables found - database is empty)');
            console.log('\nNext step: Run the schema file to create tables');
            console.log('  mysql -u root -p report < server/scripts/mysql_schema_complete.sql');
        } else {
            tables.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`  - ${tableName}`);
            });
        }

        // Close connection
        await sequelize.close();
        console.log('\n✓ Connection closed successfully');
        
    } catch (error) {
        console.error('✗ MySQL Connection Failed!');
        console.error('Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure MySQL is running');
        console.error('2. Verify database "report" exists');
        console.error('3. Check username and password in .env file');
        console.error('4. Ensure mysql2 package is installed: npm install mysql2');
        process.exit(1);
    }
}

testConnection();
