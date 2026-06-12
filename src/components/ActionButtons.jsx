import React, { useState } from 'react';

const ActionButtons = ({ onSave, onHistory, isSaved, isSaving, onAnalytics, onSearch, onAIChat, onGraph }) => {
    const [showSidePanel, setShowSidePanel] = useState(false);

    return (
        <>
            {/* ── Bottom save bar ── */}
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

            {/* ── Desktop: left-edge hover panel ── */}
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

            {/* ── Desktop: AI Chat FAB ── */}
            <button className="ai-chat-fab" onClick={onAIChat} title="AI Chat">
                ✦ AI Chat
            </button>

            {/* ── Mobile: bottom navigation bar ── */}
            <nav className="mobile-nav" aria-label="Main navigation">
                <button className="mobile-nav-btn search" onClick={onSearch}>
                    <span className="mnb-icon">🔍</span>
                    <span className="mnb-label">Search</span>
                </button>
                <button className="mobile-nav-btn analytics" onClick={onAnalytics}>
                    <span className="mnb-icon">📊</span>
                    <span className="mnb-label">Analytics</span>
                </button>
                <button className="mobile-nav-btn graph" onClick={onGraph}>
                    <span className="mnb-icon">📈</span>
                    <span className="mnb-label">Graph</span>
                </button>
                <button className="mobile-nav-btn history" onClick={onHistory}>
                    <span className="mnb-icon">📅</span>
                    <span className="mnb-label">History</span>
                </button>
                <button className="mobile-nav-btn ai-chat" onClick={onAIChat}>
                    <span className="mnb-icon">✦</span>
                    <span className="mnb-label">AI Chat</span>
                </button>
            </nav>
        </>
    );
};

export default ActionButtons;
