const fs = require('fs');
const path = require('path');

// Maintenance mode middleware - runs BEFORE auth
const checkMaintenanceMode = (req, res, next) => {
    try {
        // Always allow CORS preflight requests
        if (req.method === 'OPTIONS') {
            return next();
        }

        // Allow auth login/check even during maintenance.
        // Use originalUrl so this works regardless of middleware mounting, proxies, or trailing slashes.
        const originalPath = (req.originalUrl || '').split('?')[0];
        const fullPath = (`${req.baseUrl || ''}${req.path || ''}` || '').split('?')[0];
        const pathToCheck = (originalPath || fullPath || req.path || '').replace(/\/+$/, '');

        // Match both /api/auth/login and /auth/login forms.
        if (/^(?:\/api)?\/auth\/(login|check)$/i.test(pathToCheck)) {
            return next();
        }

        const maintenanceFilePath = path.join(__dirname, '../maintenance.json');

        // If maintenance file doesn't exist, allow access
        if (!fs.existsSync(maintenanceFilePath)) {
            return next();
        }

        // Read maintenance status
        const data = fs.readFileSync(maintenanceFilePath, 'utf8');
        const maintenanceData = JSON.parse(data);

        // If maintenance mode is off, allow access
        if (!maintenanceData.isMaintenanceMode) {
            return next();
        }

        // If maintenance mode is on, check if request has admin token
        // Extract token from header
        const token = req.header('x-auth-token');

        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

                // If user is admin, allow access
                if (decoded.user && decoded.user.role === 'admin') {
                    return next();
                }
            } catch (err) {
                // Invalid token, continue to block
            }
        }

        // Block all other users (including non-authenticated)
        return res.status(503).json({
            msg: 'System is currently under maintenance. Please try again later.',
            maintenanceMode: true
        });
    } catch (error) {
        console.error('Maintenance check error:', error);
        // On error, allow access to prevent system lockout
        next();
    }
};

module.exports = checkMaintenanceMode;
