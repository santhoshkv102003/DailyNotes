import React, { useState } from 'react';
import { api } from '../api';

const NotesSection = ({ notes, setNotes }) => {
    const textareaRef = React.useRef(null);
    const [fixing, setFixing] = useState(false);

    const handleFixGrammar = async () => {
        if (!notes || !notes.trim()) return;
        setFixing(true);
        try {
            const result = await api.fixGrammar(notes);
            if (result.fixed) {
                setNotes(result.fixed);
            }
        } catch (err) {
            alert('Grammar fix failed: ' + (err.message || 'Check server logs'));
        }
        setFixing(false);
    };

    const addNumberPoint = () => {
        let currentText = notes || '';
        let newNumber = 1;
        let prefix = '';
        let isSmartInit = false;

        const hasNumberedLines = /(\d+)\.\s/.test(currentText);

        if (currentText && !currentText.trim().match(/^\d+\.\s/) && !hasNumberedLines) {
            newNumber = 2;
            isSmartInit = true;
        } else {
            const lines = currentText.split('\n');
            for (let i = lines.length - 1; i >= 0; i--) {
                const match = lines[i].trim().match(/^(\d+)\.\s/);
                if (match) {
                    newNumber = parseInt(match[1], 10) + 1;
                    break;
                }
            }
            if (currentText && !currentText.endsWith('\n')) {
                prefix = '\n';
            }
        }

        const newText = isSmartInit
            ? `1. ${currentText}\n2. `
            : `${currentText}${prefix}${newNumber}. `;

        setNotes(newText);

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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={handleFixGrammar}
                        disabled={fixing}
                        title="Fix Grammar with AI"
                        style={{
                            background: fixing ? 'rgba(56,217,192,0.1)' : 'rgba(56,217,192,0.15)',
                            border: '1px solid rgba(56,217,192,0.4)',
                            color: '#38d9c0',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: fixing ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {fixing ? '✦ Fixing...' : '✦ Fix Grammar'}
                    </button>
                    <button
                        className="add-point-btn"
                        onClick={addNumberPoint}
                        title="Add new point"
                    >
                        +
                    </button>
                </div>
            </div>
            <textarea
                ref={textareaRef}
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>
    );
};

export default NotesSection;
