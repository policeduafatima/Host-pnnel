const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true, 
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: { 
        type: String, 
        unique: true, 
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8
    },
    profilePic: { 
        type: String, 
        default: 'https://i.imgur.com/JRqk1W1.png',
        validate: {
            validator: function(v) {
                return /^(https?:\/\/).+\.(jpg|jpeg|png|gif)$/.test(v);
            },
            message: props => `${props.value} is not a valid image URL!`
        }
    },
    githubUsername: { 
        type: String,
        trim: true
    },
    whatsappNumber: { 
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Invalid WhatsApp number']
    },
    coins: { 
        type: Number, 
        default: 100,
        min: 0
    },
    lastClaim: Date,
    referrals: [{ 
        type: String,
        trim: true
    }],
    referredBy: { 
        type: String,
        trim: true
    },
    redeemedVouchers: [{ 
        type: String,
        trim: true
    }],
    role: { 
        type: String, 
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    lastLogin: Date,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for referral URL
userSchema.virtual('referralUrl').get(function() {
    return `${process.env.BASE_URL}/signup?ref=${this.username}`;
});

module.exports = mongoose.model('User', userSchema);
