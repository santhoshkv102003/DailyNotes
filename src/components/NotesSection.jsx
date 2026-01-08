import React from 'react';

const NotesSection = ({ notes, setNotes }) => {
    return (
        <div className="notes-section">
            <h2>Daily highlights</h2>
            <textarea
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            ></textarea>
        </div>
    );
};

export default NotesSection;
