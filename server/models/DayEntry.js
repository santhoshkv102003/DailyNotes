const mongoose = require('mongoose');

const dayEntrySchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    spentMoney: [{
        description: String,
        amount: Number
    }],
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user has only one entry per date
dayEntrySchema.index({ date: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('DayEntry', dayEntrySchema);
