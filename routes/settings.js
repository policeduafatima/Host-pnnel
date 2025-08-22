const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');

// Update profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { username, email, profilePic, githubUsername, whatsappNumber } = req.body;
        
        // Check if username is available
        if (username) {
            const existingUser = await User.findOne({ 
                username,
                _id: { $ne: req.user.id }
            });
            
            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username, email, profilePic, githubUsername, whatsappNumber },
            { new: true, runValidators: true }
        ).select('-password -__v');
        
        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password
router.put('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        
        // Verify current password
        const validPassword = await user.comparePassword(currentPassword);
        if (!validPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
