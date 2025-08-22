const AdminSettings = require('../models/AdminSettings');

// Enhanced admin middleware with additional checks
const adminMiddleware = {
    // Check if user has admin privileges
    requireAdmin: (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Administrator privileges required'
            });
        }
        next();
    },

    // Check if system is in maintenance mode
    checkMaintenance: async (req, res, next) => {
        try {
            const settings = await AdminSettings.findOne();
            if (settings?.maintenance) {
                return res.status(503).json({
                    success: false,
                    message: settings.maintenanceMessage || 'System under maintenance',
                    maintenance: true
                });
            }
            next();
        } catch (error) {
            console.error('Maintenance check error:', error);
            next(error);
        }
    },

    // Validate Heroku API keys
    validateHerokuKeys: async (req, res, next) => {
        try {
            const settings = await AdminSettings.findOne();
            if (!settings?.herokuApiKeys?.length) {
                return res.status(400).json({
                    success: false,
                    message: 'No Heroku API keys configured'
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    // Rate limiting for admin actions
    rateLimitAdminActions: (req, res, next) => {
        // Implement rate limiting logic here
        // Example: Limit to 10 requests per minute
        next();
    }
};

module.exports = adminMiddleware;

