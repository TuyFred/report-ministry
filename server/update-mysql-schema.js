require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function updateSchema() {
    console.log('Updating MySQL schema to match Sequelize models...\n');

    try {
        // Read the SQL file
        const sqlFile = path.join(__dirname, 'scripts', 'mysql_schema_sequelize.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        // Split SQL commands
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'report',
            multipleStatements: true
        });

        console.log('✓ Connected to MySQL');

        // Execute all statements together
        console.log('Executing SQL statements...');
        await connection.query(sqlContent);
        console.log('✓ All statements executed');

        // Verify tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n✓ Schema updated successfully!');
        console.log('\nTables in database:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`  - ${tableName}`);
        });

        // Verify admin user
        const [users] = await connection.execute('SELECT email, role FROM users WHERE role = "admin"');
        console.log('\nAdmin users:');
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.role})`);
        });

        await connection.end();
        console.log('\n✓ Database ready for use!');
        console.log('\nNext step: Start your server with: npm run dev');

    } catch (error) {
        console.error('✗ Error updating schema:', error.message);
        process.exit(1);
    }
}

updateSchema();
