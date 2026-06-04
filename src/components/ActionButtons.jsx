import React, { useState } from 'react';

const ActionButtons = ({ onSave, onHistory, isSaved, onAnalytics, onSearch, onAIChat, onLogout, username }) => {
    const [showSidePanel, setShowSidePanel] = useState(false);

    return (
        <>
            {/* Main bottom bar — only Save button */}
            <div className="buttons-section">
                <button
                    className="save-btn"
                    onClick={onSave}
                    style={isSaved ? { background: 'linear-gradient(135deg, #34d399, #2bbfa8)' } : {}}
                >
                    {isSaved ? '✓ Saved!' : 'SAVE'}
                </button>
            </div>

            {/* Left-edge hover trigger zone + sliding panel */}
            <div
                className="left-edge-trigger"
                onMouseEnter={() => setShowSidePanel(true)}
                onMouseLeave={() => setShowSidePanel(false)}
            >
                {/* Invisible hover strip on the very left edge */}
                <div className="left-edge-strip" />

                {/* Sliding panel with buttons */}
                <div className={`left-side-panel${showSidePanel ? ' visible' : ''}`}>
                    <button className="side-panel-btn search-side" onClick={onSearch}>
                        🔍 Search
                    </button>
                    <button className="side-panel-btn analytics-side" onClick={onAnalytics}>
                        📊 Analytics
                    </button>
                    <button className="side-panel-btn history-side" onClick={onHistory}>
                        📅 History
                    </button>

                    <div className="side-panel-divider" />

                    <div className="side-panel-user">
                        <span className="side-panel-username">👤 {username}</span>
                        <button className="side-panel-btn logout-side" onClick={onLogout}>
                            ⏻ Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Chat floating button — bottom-right, always visible */}
            <button className="ai-chat-fab" onClick={onAIChat} title="AI Chat">
                ✦ AI Chat
            </button>
        </>
    );
};

export default ActionButtons;
