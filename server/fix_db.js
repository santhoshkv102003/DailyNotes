require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const collection = mongoose.connection.db.collection('dayentries');

        console.log('Listing current indexes...');
        const indexes = await collection.indexes();
        console.log(indexes);

        // Look for the old index on just "date"
        const dateIndex = indexes.find(idx => idx.name === 'date_1');

        if (dateIndex) {
            console.log('Found old index "date_1". Dropping it to allow multiple users to have entries for the same date...');
            await collection.dropIndex('date_1');
            console.log('Successfully dropped "date_1" index.');
        } else {
            console.log('Old "date_1" index not found. Checking for new compound index...');
        }

        // Mongoose will rebuild the correct index on next app startup
        console.log('Index fix complete. Please restart your server application.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

fixIndexes();
