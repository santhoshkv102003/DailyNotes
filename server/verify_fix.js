require('dotenv').config();
const mongoose = require('mongoose');
const DayEntry = require('./models/DayEntry');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const id1 = new mongoose.Types.ObjectId();
        const id2 = new mongoose.Types.ObjectId();
        const date = '2099-01-01';

        await DayEntry.deleteMany({ date });

        console.log('Creating entry 1...');
        await DayEntry.create({ date, userId: id1, notes: 'User 1' });

        console.log('Creating entry 2 (same date, diff user)...');
        await DayEntry.create({ date, userId: id2, notes: 'User 2' });

        console.log('SUCCESS: Both entries created. Old unique constraint is gone.');

        await DayEntry.deleteMany({ date });

    } catch (err) {
        console.error('VERIFICATION FAILED:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}
verify();
