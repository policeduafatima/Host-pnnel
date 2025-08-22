const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    herokuApiKeys: [{ 
        type: String,
        trim: true
    }],
    activeHerokuKeyIndex: { 
        type: Number,
        default: 0
    },
    mongoUrl: { 
        type: String,
        trim: true
    },
    githubRepo: { 
        type: String,
        default: 'https://github.com/policeduafatima/FARIMA-MD',
        trim: true
    },
    maintenance: { 
        type: Boolean, 
        default: false 
    },
    maintenanceMessage: { 
        type: String,
        default: 'We are currently undergoing maintenance. Please check back later.'
    },
    coinSettings: {
        deploymentCost: { type: Number, default: 10 },
        dailyClaim: { type: Number, default: 10 },
        referralBonus: { type: Number, default: 5 },
        voucherAmount: { type: Number, default: 10 }
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Method to get next Heroku API key (round-robin)
adminSettingsSchema.methods.getNextHerokuKey = function() {
    this.activeHerokuKeyIndex = (this.activeHerokuKeyIndex + 1) % this.herokuApiKeys.length;
    return this.herokuApiKeys[this.activeHerokuKeyIndex];
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
      
