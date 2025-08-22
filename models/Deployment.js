const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    appName: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'App name can only contain lowercase letters, numbers and hyphens']
    },
    url: { 
        type: String, 
        required: true,
        match: [/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, 'Invalid URL']
    },
    herokuAppId: { 
        type: String,
        required: true
    },
    status: { 
        type: String, 
        enum: ['active', 'suspended', 'pending', 'failed'], 
        default: 'pending' 
    },
    lastPaid: { 
        type: Date,
        default: Date.now
    },
    nextPaymentDue: { 
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    },
    config: {
        sessionId: { type: String, required: true },
        prefix: { type: String, default: '.' },
        botName: { type: String, default: 'FATIMA-MD' },
        alwaysOnline: { type: Boolean, default: true },
        autoReply: { type: Boolean, default: true },
        // Add other config fields as needed
    },
    logs: [{
        timestamp: { type: Date, default: Date.now },
        message: String,
        type: { type: String, enum: ['info', 'error', 'warning'] }
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Indexes for faster queries
deploymentSchema.index({ userId: 1 });
deploymentSchema.index({ status: 1 });
deploymentSchema.index({ nextPaymentDue: 1 });

// Virtual for deployment age
deploymentSchema.virtual('age').get(function() {
    const diff = Date.now() - this.createdAt.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours.toFixed(1)}h`;
});

module.exports = mongoose.model('Deployment', deploymentSchema);
