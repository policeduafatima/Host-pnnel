const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { authenticate } = require('../middleware/auth');

// Claim daily coins
router.post('/claim', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Check if user can claim (once per 24 hours)
        if (user.lastClaim) {
            const hoursSinceLastClaim = (Date.now() - user.lastClaim) / (1000 * 60 * 60);
            if (hoursSinceLastClaim < 24) {
                const hoursLeft = Math.floor(24 - hoursSinceLastClaim);
                return res.status(400).json({ 
                    error: `You can claim again in ${hoursLeft} hours` 
                });
            }
        }
        
        // Add coins
        user.coins += 10;
        user.lastClaim = new Date();
        await user.save();
        
        // Record transaction
        const transaction = new Transaction({
            userId: user._id,
            type: 'credit',
            amount: 10,
            description: 'Daily coin claim'
        });
        
        await transaction.save();
        
        res.json({ coins: user.coins });
    } catch (error) {
        console.error('Claim coins error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Redeem voucher
router.post('/redeem', authenticate, async (req, res) => {
    try {
        const { voucherCode } = req.body;
        const user = await User.findById(req.user.id);
        
        // Check voucher validity
        if (voucherCode !== 'subzero_md') {
            return res.status(400).json({ error: 'Invalid voucher code' });
        }
        
        // Check if already redeemed
        if (user.redeemedVouchers.includes(voucherCode)) {
            return res.status(400).json({ error: 'Voucher already redeemed' });
        }
        
        // Add coins
        user.coins += 10;
        user.redeemedVouchers.push(voucherCode);
        await user.save();
        
        // Record transaction
        const transaction = new Transaction({
            userId: user._id,
            type: 'credit',
            amount: 10,
            description: 'Voucher redemption',
            reference: voucherCode,
            referenceModel: 'Voucher'
        });
        
        await transaction.save();
        
        res.json({ 
            coins: user.coins,
            coinsAdded: 10
        });
    } catch (error) {
        console.error('Redeem voucher error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send coins to another user
router.post('/send', authenticate, async (req, res) => {
    try {
        const { recipient, amount } = req.body;
        const sender = await User.findById(req.user.id);
        
        // Validate amount
        if (amount <= 0 || !Number.isInteger(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        if (sender.coins < amount) {
            return res.status(400).json({ error: 'Not enough coins' });
        }
        
        // Find recipient
        const recipientUser = await User.findOne({ 
            $or: [{ username: recipient }, { email: recipient }],
            _id: { $ne: sender._id }
        });
        
        if (!recipientUser) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        
        // Perform transaction
        sender.coins -= amount;
        recipientUser.coins += amount;
        
        await Promise.all([sender.save(), recipientUser.save()]);
        
        // Record transactions for both users
        const senderTransaction = new Transaction({
            userId: sender._id,
            type: 'debit',
            amount,
            description: `Sent to ${recipientUser.username}`,
            reference: recipientUser._id,
            referenceModel: 'User'
        });
        
        const recipientTransaction = new Transaction({
            userId: recipientUser._id,
            type: 'credit',
            amount,
            description: `Received from ${sender.username}`,
            reference: sender._id,
            referenceModel: 'User'
        });
        
        await Promise.all([
            senderTransaction.save(),
            recipientTransaction.save()
        ]);
        
        res.json({ 
            coins: sender.coins,
            message: `Sent ${amount} coins to ${recipientUser.username}`
        });
    } catch (error) {
        console.error('Send coins error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
