import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';

const SUGGESTIONS = [
    'What did I do last week?',
    'Where did I spend the most money?',
    'Show my food expenses this month',
    'Which day had the most spending?',
    'Summarize my notes from this week',
];

const AIChatSidebar = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I know all your notes and expenses. Ask me anything — like "what did I spend on food this month?" or "what did I do last week?"' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text) => {
        const userText = text || input.trim();
        if (!userText) return;

        const newMessages = [...messages, { role: 'user', text: userText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const history = newMessages.slice(0, -1); // exclude the one just added
            const result = await api.chat(userText, history);
            setMessages([...newMessages, { role: 'assistant', text: result.reply }]);
        } catch {
            setMessages([...newMessages, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="ai-sidebar-overlay" onClick={onClose}>
            <div className="ai-sidebar" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="ai-sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="ai-avatar">✦</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>AI Assistant</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--teal)' }}>Powered by Gemini</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="ai-close-btn">&times;</button>
                </div>

                {/* Messages */}
                <div className="ai-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`ai-message ${msg.role}`}>
                            {msg.role === 'assistant' && <div className="ai-msg-avatar">✦</div>}
                            <div className="ai-msg-bubble">
                                {msg.text.split('\n').map((line, j) => (
                                    <p key={j} style={{ margin: j > 0 ? '4px 0 0' : 0 }}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="ai-message assistant">
                            <div className="ai-msg-avatar">✦</div>
                            <div className="ai-msg-bubble ai-typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && (
                    <div className="ai-suggestions">
                        {SUGGESTIONS.map((s, i) => (
                            <button key={i} className="ai-suggestion-chip" onClick={() => sendMessage(s)}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="ai-input-row">
                    <input
                        type="text"
                        placeholder="Ask anything about your notes or expenses..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        disabled={loading}
                        className="ai-input"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="ai-send-btn"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatSidebar;
