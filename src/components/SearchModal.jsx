import React, { useState } from 'react';
import { api } from '../api';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);

    const EXAMPLES = [
        'Days I bought milk or vegetables',
        'When did I spend on groceries?',
        'Days I spent on transport',
        'My most expensive day',
    ];

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(false);
        try {
            const data = await api.search(query);
            setAnswer(data.answer || '');
            setResults(data.results || []);
            setSearched(true);
        } catch {
            setAnswer('Search failed. Please try again.');
            setResults([]);
            setSearched(true);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', height: 'auto', maxHeight: '85vh', overflowY: 'auto' }}>
                <span className="close" onClick={onClose}>&times;</span>

                <h2 style={{ marginBottom: '6px', fontSize: '1.3rem' }}>🔍 Natural Language Search</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    Ask anything about your diary in plain English
                </p>

                {/* Search Input */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="e.g. days I spent on milk or vegetables..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, var(--accent), #9b59f7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: (!query.trim() || loading) ? 0.6 : 1
                        }}
                    >
                        {loading ? '...' : 'Search'}
                    </button>
                </div>

                {/* Example chips */}
                {!searched && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                        {EXAMPLES.map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => { setQuery(ex); }}
                                style={{
                                    padding: '5px 14px',
                                    background: 'rgba(124,106,247,0.1)',
                                    border: '1px solid rgba(124,106,247,0.25)',
                                    borderRadius: '20px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 12px' }}></div>
                        Searching your diary...
                    </div>
                )}

                {/* Answer */}
                {searched && !loading && (
                    <>
                        <div style={{
                            background: 'rgba(56,217,192,0.08)',
                            border: '1px solid rgba(56,217,192,0.2)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px 18px',
                            marginBottom: '20px',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            lineHeight: 1.6
                        }}>
                            {answer}
                        </div>

                        {results.length > 0 && (
                            <>
                                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                    Matching Days ({results.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {results.map((entry, i) => {
                                        const total = (entry.spentMoney || []).reduce((s, x) => s + x.amount, 0);
                                        return (
                                            <div key={i} style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid var(--border)',
                                                borderLeft: '3px solid var(--accent)',
                                                borderRadius: 'var(--radius-sm)',
                                                padding: '14px 16px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <strong style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>{entry.date}</strong>
                                                    {total > 0 && <span style={{ color: 'var(--teal)', fontWeight: 700 }}>₹{total.toFixed(2)}</span>}
                                                </div>
                                                {entry.notes && (
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', lineHeight: 1.5 }}>
                                                        {entry.notes.slice(0, 120)}{entry.notes.length > 120 ? '...' : ''}
                                                    </p>
                                                )}
                                                {entry.spentMoney && entry.spentMoney.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {entry.spentMoney.map((s, j) => (
                                                            <span key={j} style={{
                                                                background: 'rgba(124,106,247,0.12)',
                                                                border: '1px solid rgba(124,106,247,0.2)',
                                                                borderRadius: '10px',
                                                                padding: '2px 10px',
                                                                fontSize: '0.78rem',
                                                                color: 'var(--text-secondary)'
                                                            }}>
                                                                {s.description} ₹{s.amount}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchModal;
