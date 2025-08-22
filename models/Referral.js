const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    refereeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    refereeUsername: { 
        type: String, 
        required: true,
        trim: true
    },
    coinsEarned: { 
        type: Number, 
        default: 5,
        min: 0
    },
    isPaid: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Indexes for faster queries
referralSchema.index({ referrerId: 1 });
referralSchema.index({ refereeId: 1 }, { unique: true });
referralSchema.index({ createdAt: -1 });

// Ensure a user can't refer themselves
referralSchema.pre('save', function(next) {
    if (this.referrerId.equals(this.refereeId)) {
        throw new Error('User cannot refer themselves');
    }
    next();
});

module.exports = mongoose.model('Referral', referralSchema);
