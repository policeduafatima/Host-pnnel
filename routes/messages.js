const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');

// Send message
router.post('/', authenticate, async (req, res) => {
    try {
        const { content, recipientId } = req.body;
        
        const message = new Message({
            sender: req.user.id,
            senderRole: req.user.role,
            recipient: recipientId,
            content
        });
        
        await message.save();
        
        res.json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get messages
router.get('/', authenticate, async (req, res) => {
    try {
        let query;
        
        if (req.user.role === 'admin') {
            // Admin can see all messages
            query = Message.find()
                .sort({ createdAt: -1 })
                .limit(100);
        } else {
            // Users can only see their messages
            query = Message.find({
                $or: [
                    { sender: req.user.id },
                    { recipient: req.user.id }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(100);
        }
        
        const messages = await query.populate('sender recipient', 'username profilePic role');
        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin broadcast
router.post('/broadcast', authenticate, isAdmin, async (req, res) => {
    try {
        const { content } = req.body;
        
        const message = new Message({
            sender: req.user.id,
            senderRole: 'admin',
            isAdminMessage: true,
            content
        });
        
        await message.save();
        
        res.json(message);
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark message as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const message = await Message.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json(message);
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
