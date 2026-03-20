const fs = require('fs');
const path = require('path');

// Maintenance mode state file
const maintenanceFilePath = path.join(__dirname, '../maintenance.json');

// Initialize maintenance file if it doesn't exist
const initMaintenanceFile = () => {
    if (!fs.existsSync(maintenanceFilePath)) {
        fs.writeFileSync(maintenanceFilePath, JSON.stringify({ isMaintenanceMode: false }));
    }
};

// Get maintenance mode status
const getStatus = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        initMaintenanceFile();
        const data = fs.readFileSync(maintenanceFilePath, 'utf8');
        const maintenanceData = JSON.parse(data);

        res.json({
            isMaintenanceMode: maintenanceData.isMaintenanceMode || false
        });
    } catch (error) {
        console.error('Error getting maintenance status:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

// Toggle maintenance mode
const toggleMaintenance = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        initMaintenanceFile();
        const data = fs.readFileSync(maintenanceFilePath, 'utf8');
        const maintenanceData = JSON.parse(data);

        // Toggle the status
        maintenanceData.isMaintenanceMode = !maintenanceData.isMaintenanceMode;
        maintenanceData.lastUpdated = new Date().toISOString();
        maintenanceData.updatedBy = req.user.id;

        // Save to file
        fs.writeFileSync(maintenanceFilePath, JSON.stringify(maintenanceData, null, 2));

        res.json({
            isMaintenanceMode: maintenanceData.isMaintenanceMode,
            msg: maintenanceData.isMaintenanceMode
                ? 'Maintenance mode enabled'
                : 'Maintenance mode disabled'
        });
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    getStatus,
    toggleMaintenance
};
