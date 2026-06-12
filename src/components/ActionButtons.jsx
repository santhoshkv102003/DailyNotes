import React, { useState } from 'react';

const ActionButtons = ({ onSave, onHistory, isSaved, isSaving, onAnalytics, onSearch, onAIChat, onGraph }) => {
    const [showSidePanel, setShowSidePanel] = useState(false);

    return (
        <>
            {/* Main bottom bar — only Save button */}
            <div className="buttons-section">
                <button
                    className="save-btn"
                    onClick={onSave}
                    disabled={isSaving}
                    style={isSaved ? { background: 'linear-gradient(135deg, #34d399, #2bbfa8)' } : {}}
                >
                    {isSaving ? 'Saving...' : isSaved ? '✓ Saved!' : 'SAVE'}
                </button>
            </div>

            {/* Left-edge hover trigger zone + sliding panel */}
            <div
                className="left-edge-trigger"
                onMouseEnter={() => setShowSidePanel(true)}
                onMouseLeave={() => setShowSidePanel(false)}
            >
                <div className="left-edge-strip" />
                <div className={`left-side-panel${showSidePanel ? ' visible' : ''}`}>
                    <button className="side-panel-btn search-side" onClick={onSearch}>
                        🔍 Search
                    </button>
                    <button className="side-panel-btn analytics-side" onClick={onAnalytics}>
                        📊 Analytics
                    </button>
                    <button className="side-panel-btn graph-side" onClick={onGraph}>
                        📈 Graph
                    </button>
                    <button className="side-panel-btn history-side" onClick={onHistory}>
                        📅 History
                    </button>
                </div>
            </div>

            {/* AI Chat floating button — bottom-right */}
            <button className="ai-chat-fab" onClick={onAIChat} title="AI Chat">
                ✦ AI Chat
            </button>
        </>
    );
};

export default ActionButtons;
