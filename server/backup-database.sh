#!/bin/bash
# Database Backup Script for cPanel
# Run this weekly via cron

# Configuration
DB_NAME="cpanel_username_report"
DB_USER="cpanel_username_dbuser"
DB_PASS="your_database_password"
BACKUP_DIR="/home/your_username/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ministry_db_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Dump database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "ministry_db_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
