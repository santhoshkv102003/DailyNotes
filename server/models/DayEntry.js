const mongoose = require('mongoose');

const dayEntrySchema = new mongoose.Schema({
    userId: {
        type: String,   // username used as the user identifier
        required: true,
        index: true
    },
    date: {
        type: String,   // Format: YYYY-MM-DD
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    spentMoney: [{
        description: String,
        amount: Number,
        category: {
            type: String,
            default: 'Other'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// Each user can only have one entry per date
dayEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DayEntry', dayEntrySchema);
