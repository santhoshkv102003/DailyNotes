import React from 'react';

const ActionButtons = ({ onSave, onHistory, isSaved }) => {
    return (
        <div className="buttons-section">
            <button
                className="save-btn"
                onClick={onSave}
                style={isSaved ? { background: '#4CAF50' } : {}}
            >
                {isSaved ? '✓ Saved!' : 'SAVE'}
            </button>
            <button className="history-btn" onClick={onHistory}>History</button>
        </div>
    );
};

export default ActionButtons;
