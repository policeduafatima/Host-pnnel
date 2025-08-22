const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username or email
        const user = await User.findOne({ 
            $or: [{ username }, { email: username }] 
        });
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Account suspended' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({ 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
                coins: user.coins,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, referralCode } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            referredBy: referralCode
        });

        await user.save();

        // Handle referral if exists
        if (referralCode) {
            await handleReferral(referralCode, user.username);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
                coins: user.coins,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user
router.get('/user', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -__v');
            
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to handle referrals
async function handleReferral(referralCode, newUsername) {
    const referrer = await User.findOne({ username: referralCode });
    if (!referrer) return;
    
    referrer.referrals.push(newUsername);
    referrer.coins += 5; // 5 coins for referral
    await referrer.save();
    
    // Create referral record
    const Referral = require('../models/Referral');
    await Referral.create({
        referrerId: referrer._id,
        refereeUsername: newUsername,
        coinsEarned: 5
    });
}

// Middleware to authenticate JWT
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
}

module.exports = router;
