require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const DayEntry = require('./models/DayEntry');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/ai', aiRoutes);

// GET /api/days/:date
app.get('/api/days/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const entry = await DayEntry.findOne({ date });
        if (!entry) return res.json({ notes: '', spentMoney: [] });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/days
app.post('/api/days', async (req, res) => {
    try {
        const { date, notes, spentMoney, mode } = req.body;

        let updateOperation;

        if (mode === 'append') {
            const existingEntry = await DayEntry.findOne({ date });
            if (existingEntry) {
                const newNotes = existingEntry.notes
                    ? (notes ? existingEntry.notes + '\n' + notes : existingEntry.notes)
                    : notes;
                const newSpentMoney = existingEntry.spentMoney.concat(spentMoney || []);
                updateOperation = { $set: { notes: newNotes, spentMoney: newSpentMoney, lastModified: Date.now() } };
            } else {
                updateOperation = { $set: { notes, spentMoney, lastModified: Date.now() } };
            }
        } else {
            updateOperation = { $set: { notes, spentMoney, lastModified: Date.now() } };
        }

        let entry;
        try {
            entry = await DayEntry.findOneAndUpdate(
                { date },
                updateOperation,
                { new: true, upsert: true }
            );
        } catch (upsertErr) {
            // Handle duplicate key race condition: retry as a regular update
            if (upsertErr.code === 11000) {
                entry = await DayEntry.findOneAndUpdate(
                    { date },
                    updateOperation,
                    { new: true }
                );
            } else {
                throw upsertErr;
            }
        }
        res.json(entry);
    } catch (err) {
        console.error('Error in POST /api/days:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/days/:date
app.delete('/api/days/:date', async (req, res) => {
    try {
        const { date } = req.params;
        await DayEntry.findOneAndDelete({ date });
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/days/range/all
app.get('/api/days/range/all', async (req, res) => {
    try {
        const days = await DayEntry.find({}, 'date').sort({ date: 1 });
        res.json(days.map(d => d.date));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
