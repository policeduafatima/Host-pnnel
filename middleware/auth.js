const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main authentication middleware
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists
        const user = await User.findOne({ 
            _id: decoded.id,
            isActive: true 
        }).select('-password');

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found or account deactivated'
            });
        }

        // Attach user to request
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ 
            success: false,
            message: 'Please authenticate',
            error: error.message
        });
    }
};

// Admin role checker
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin privileges required'
        });
    }
    next();
};

// Maintenance mode checker
const checkMaintenance = async (req, res, next) => {
    try {
        const settings = await AdminSettings.findOne();
        if (settings?.maintenance && req.user?.role !== 'admin') {
            return res.status(503).json({
                success: false,
                message: settings.maintenanceMessage || 'System under maintenance'
            });
        }
        next();
    } catch (error) {
        console.error('Maintenance check error:', error);
        next();
    }
};

module.exports = {
    authenticate,
    isAdmin,
    checkMaintenance
};
          
