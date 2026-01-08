import React from 'react';

const NotesSection = ({ notes, setNotes }) => {
    const textareaRef = React.useRef(null);

    const addNumberPoint = () => {
        let currentText = notes || '';
        let newNumber = 1;
        let prefix = '';
        let isSmartInit = false;

        // Pattern to find any numbered line "1. ", "2. " etc.
        const hasNumberedLines = /(\d+)\.\s/.test(currentText);

        if (currentText && !currentText.trim().match(/^\d+\.\s/) && !hasNumberedLines) {
            // Smart Init: Text exists but no numbers found.
            // Treat the existing text as point 1.
            const lines = currentText.split('\n');
            // We need to re-construct the text.
            // Actually, simplest way: Prepend "1. " to the first line (or all text if one line)
            // But user might have multiple lines of text. 
            // Let's just prepend "1. " to the very beginning of the string.
            // And then append "\n2. "
            // Wait, if cursor is effectively at end, we just modify the whole string.

            newNumber = 2;
            isSmartInit = true; // Flag to indicate we are determining the whole new text differently
        } else {
            // Standard Logic: Find last number
            // Pattern to find the last number at the beginning of a line
            // Matches "1. ", "10. ", etc.
            const lines = currentText.split('\n');

            // Iterate backwards to find the last valid numbered line
            for (let i = lines.length - 1; i >= 0; i--) {
                const match = lines[i].trim().match(/^(\d+)\.\s/);
                if (match) {
                    newNumber = parseInt(match[1], 10) + 1;
                    break;
                }
            }

            // Determine prefix: if text is empty, just number. 
            // If not empty and doesn't end in newline, add newline first.
            if (currentText && !currentText.endsWith('\n')) {
                prefix = '\n';
            }
        }

        let newText;
        if (isSmartInit) {
            newText = `1. ${currentText}\n2. `;
        } else {
            newText = `${currentText}${prefix}${newNumber}. `;
        }

        setNotes(newText);

        // Focus and place cursor at end
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const len = textareaRef.current.value.length;
                textareaRef.current.setSelectionRange(len, len);
                textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            }
        }, 0);
    };

    return (
        <div className="notes-section">
            <div className="notes-header">
                <h2>Daily highlights</h2>
                <button
                    className="add-point-btn"
                    onClick={addNumberPoint}
                    title="Add new point"
                >
                    +
                </button>
            </div>
            <textarea
                ref={textareaRef}
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            ></textarea>
        </div>
    );
};

export default NotesSection;
