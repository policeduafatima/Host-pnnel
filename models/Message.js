const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    senderRole: { 
        type: String, 
        enum: ['user', 'admin'], 
        required: true 
    },
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }, // null for admin messages
    content: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 1000
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    isAdminMessage: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Indexes for faster queries
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Virtual for formatted time
messageSchema.virtual('time').get(function() {
    return this.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

module.exports = mongoose.model('Message', messageSchema);
