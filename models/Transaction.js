const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['credit', 'debit'], 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true,
        min: 1
    },
    description: { 
        type: String, 
        required: true,
        trim: true
    },
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        enum: ['Deployment', 'User', 'Voucher']
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Indexes for faster queries
transactionSchema.index({ userId: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ reference: 1, referenceModel: 1 });

// Virtual for formatted date
transactionSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleString();
});

module.exports = mongoose.model('Transaction', transactionSchema);
