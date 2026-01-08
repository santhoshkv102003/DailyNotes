const mongoose = require('mongoose');

const dayEntrySchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        unique: true
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

module.exports = mongoose.model('DayEntry', dayEntrySchema);
