require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const DayEntry = require('./models/DayEntry');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes

// GET /api/days/:date - Fetch entry for a specific date
app.get('/api/days/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const entry = await DayEntry.findOne({ date });
        if (!entry) {
            return res.json({ notes: '', spentMoney: [] });
        }
        res.json(entry);
    } catch (err) {
        console.error('Error in GET /api/days/:date:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/days - Create or Update entry
app.post('/api/days', async (req, res) => {
    try {
        const { date, notes, spentMoney } = req.body;
        console.log('Saving entry for date:', date); // Debug log

        // Upsert: Update if exists, Insert if not
        const entry = await DayEntry.findOneAndUpdate(
            { date },
            { $set: { notes, spentMoney, lastModified: Date.now() } },
            { new: true, upsert: true }
        );

        res.json(entry);
    } catch (err) {
        console.error('Error in POST /api/days:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/days/:date - Delete entry
app.delete('/api/days/:date', async (req, res) => {
    try {
        const { date } = req.params;
        await DayEntry.findOneAndDelete({ date });
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        console.error('Error in DELETE /api/days/:date:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/days/range/all - Get all valid dates (for validation/navigation limits)
app.get('/api/days/range/all', async (req, res) => {
    try {
        // Return only dates to keep payload small
        const days = await DayEntry.find({}, 'date').sort({ date: 1 });
        const dates = days.map(d => d.date);
        res.json(dates);
    } catch (err) {
        console.error('Error in GET /api/days/range/all:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
