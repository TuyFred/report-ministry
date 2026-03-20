const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Backup directory
const backupDir = path.join(__dirname, '../backups');

// Initialize backup directory
const initBackupDirectory = () => {
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
};

const escapeSqlString = (value) => {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "''")
        .replace(/\u0000/g, '');
};

const quoteIdent = (ident) => {
    return `"${String(ident).replace(/"/g, '""')}"`;
};

const tableNameSql = (model) => {
    const tn = typeof model.getTableName === 'function' ? model.getTableName() : model.tableName;
    if (typeof tn === 'string') return quoteIdent(tn);
    if (tn && typeof tn === 'object') {
        const name = quoteIdent(tn.tableName);
        return tn.schema ? `${quoteIdent(tn.schema)}.${name}` : name;
    }
    return quoteIdent(String(tn));
};

const sqlLiteral = (value, attributeType) => {
    if (value === null || value === undefined) return 'NULL';

    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);

    // Dates
    if (value instanceof Date) {
        // Use ISO; Postgres accepts this
        return `'${escapeSqlString(value.toISOString())}'`;
    }

    // JSON/JSONB
    const typeKey = attributeType?.key || attributeType?.constructor?.key;
    const isJson = typeKey === 'JSON' || typeKey === 'JSONB';
    if (isJson || (typeof value === 'object' && value !== null)) {
        const json = JSON.stringify(value);
        const cast = typeKey === 'JSONB' ? '::jsonb' : '::json';
        return `'${escapeSqlString(json)}'${cast}`;
    }

    // Default: string
    return `'${escapeSqlString(value)}'`;
};

const buildInsertStatements = (model, rows) => {
    const attributes = model.rawAttributes || {};
    const columns = Object.keys(attributes);
    const tableSql = tableNameSql(model);
    const lines = [];

    for (const row of rows) {
        const colSql = columns.map(quoteIdent).join(', ');
        const valuesSql = columns
            .map((col) => sqlLiteral(row[col], attributes[col]?.type))
            .join(', ');
        lines.push(`INSERT INTO ${tableSql} (${colSql}) VALUES (${valuesSql});`);
    }

    return lines;
};

const buildSequenceFix = (model) => {
    const attributes = model.rawAttributes || {};
    if (!attributes.id) return [];

    // Only attempt to adjust sequences for integer auto-increment IDs
    const idTypeKey = attributes.id.type?.key || attributes.id.type?.constructor?.key;
    if (idTypeKey !== 'INTEGER') return [];

    const tableSql = tableNameSql(model);
    const tableNameForFn = tableSql; // already quoted and schema-qualified if needed

    return [
        `SELECT setval(pg_get_serial_sequence('${escapeSqlString(tableNameForFn)}', 'id'), COALESCE((SELECT MAX(${quoteIdent('id')}) FROM ${tableSql}), 0) + 1, false);`
    ];
};

// Get backup history
const getBackupHistory = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        initBackupDirectory();

        // Read all files in backup directory
        const files = fs.readdirSync(backupDir);
        const backups = files
            // Keep UI focused on SQL backups only
            .filter(file => file.endsWith('.sql'))
            .map(file => {
                const filePath = path.join(backupDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    createdAt: stats.birthtime,
                    size: stats.size,
                    status: 'completed'
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

        res.json({ backups });
    } catch (error) {
        console.error('Error getting backup history:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

// Create backup
const createBackup = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        initBackupDirectory();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${timestamp}.sql`;
        const filePath = path.join(backupDir, filename);

        // Get database configuration from environment (optional).
        // In production (Render/Supabase), apps often only have DATABASE_URL, not DB_NAME/DB_USER.
        const dbName = process.env.DB_NAME;
        const dbUser = process.env.DB_USER;
        const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS;
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 5432;

        const canUsePgDump = Boolean(dbName && dbUser);

        if (canUsePgDump) {
            // For PostgreSQL using pg_dump (plain format since we use .sql extension)
            const command = `PGPASSWORD="${dbPassword || ''}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F p -b -v -f "${filePath}" ${dbName}`;

            try {
                await execPromise(command);
                return res.json({
                    msg: 'Backup created successfully',
                    filename,
                    downloadUrl: `/api/backup/download/${filename}`
                });
            } catch (cmdError) {
                console.error('Error executing pg_dump backup command; falling back to SQL-from-data backup:', cmdError);
            }
        }

        // Fallback: Generate a Postgres-compatible SQL file using Sequelize data.
        // This works even in DATABASE_URL-only environments where pg_dump isn't installed.
        const User = require('../models/User');
        const Report = require('../models/Report');
        const Attachment = require('../models/Attachment');
        const ReportFormTemplate = require('../models/ReportFormTemplate');

        const [users, reports, attachments, templates] = await Promise.all([
            User.findAll({ raw: true, order: [['id', 'ASC']] }),
            Report.findAll({ raw: true, order: [['id', 'ASC']] }),
            Attachment.findAll({ raw: true, order: [['id', 'ASC']] }),
            ReportFormTemplate.findAll({ raw: true, order: [['id', 'ASC']] })
        ]);

        const lines = [];
        lines.push('-- Ministry Report System SQL Backup');
        lines.push(`-- Generated at: ${new Date().toISOString()}`);
        lines.push('');
        lines.push('BEGIN;');
        lines.push('');

        // Truncate in dependency-safe order
        lines.push(`TRUNCATE TABLE ${tableNameSql(Attachment)}, ${tableNameSql(Report)}, ${tableNameSql(ReportFormTemplate)}, ${tableNameSql(User)} RESTART IDENTITY CASCADE;`);
        lines.push('');

        if (users.length) {
            lines.push(`-- Users (${users.length})`);
            lines.push(...buildInsertStatements(User, users));
            lines.push('');
        }
        if (reports.length) {
            lines.push(`-- Reports (${reports.length})`);
            lines.push(...buildInsertStatements(Report, reports));
            lines.push('');
        }
        if (attachments.length) {
            lines.push(`-- Attachments (${attachments.length})`);
            lines.push(...buildInsertStatements(Attachment, attachments));
            lines.push('');
        }
        if (templates.length) {
            lines.push(`-- Report Form Templates (${templates.length})`);
            lines.push(...buildInsertStatements(ReportFormTemplate, templates));
            lines.push('');
        }

        // Fix sequences so future inserts don't collide
        lines.push('-- Sequence fixes');
        lines.push(...buildSequenceFix(User));
        lines.push(...buildSequenceFix(Report));
        lines.push(...buildSequenceFix(Attachment));
        lines.push(...buildSequenceFix(ReportFormTemplate));
        lines.push('');

        lines.push('COMMIT;');
        lines.push('');

        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

        return res.json({
            msg: 'Backup created successfully (SQL format)',
            filename,
            downloadUrl: `/api/backup/download/${filename}`
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ msg: 'Failed to create backup', error: error.message });
    }
};

// Download backup
const downloadBackup = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        const { filename } = req.params;
        const filePath = path.join(backupDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ msg: 'Backup file not found' });
        }

        // Send file
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error downloading backup:', err);
                res.status(500).json({ msg: 'Error downloading backup' });
            }
        });
    } catch (error) {
        console.error('Error downloading backup:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    getBackupHistory,
    createBackup,
    downloadBackup
};
