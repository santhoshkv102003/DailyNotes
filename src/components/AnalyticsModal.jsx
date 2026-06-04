import React, { useState, useEffect } from 'react';
import { api } from '../api';

const CATEGORY_COLORS = {
    Food:          '#f97316',
    Groceries:     '#22c55e',
    Transport:     '#3b82f6',
    Clothing:      '#a855f7',
    Entertainment: '#ec4899',
    Health:        '#ef4444',
    Education:     '#06b6d4',
    Utilities:     '#eab308',
    Shopping:      '#f43f5e',
    Travel:        '#14b8a6',
    Other:         '#6b7280',
};

const AnalyticsModal = ({ isOpen, onClose }) => {
    const [period, setPeriod] = useState('month');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadAnalytics = async (p) => {
        setLoading(true);
        try {
            const result = await api.analytics(p);
            setData(result);
        } catch {
            setData(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) loadAnalytics(period);
    }, [isOpen, period]);

    if (!isOpen) return null;

    const categories = data ? Object.entries(data.categoryTotals).sort((a, b) => b[1] - a[1]) : [];
    const maxAmount = categories.length > 0 ? categories[0][1] : 1;

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', height: 'auto', maxHeight: '85vh', overflowY: 'auto' }}>
                <span className="close" onClick={onClose}>&times;</span>

                <h2 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>📊 Expense Analytics</h2>

                {/* Period Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                    {['week', 'month'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '8px 24px',
                                borderRadius: '20px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                background: period === p
                                    ? 'linear-gradient(135deg, var(--accent), #9b59f7)'
                                    : 'rgba(255,255,255,0.06)',
                                color: period === p ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                        >
                            This {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 12px' }}></div>
                        Loading analytics...
                    </div>
                )}

                {!loading && data && (
                    <>
                        {/* Grand Total */}
                        <div style={{
                            background: 'rgba(124,106,247,0.1)',
                            border: '1px solid rgba(124,106,247,0.3)',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            marginBottom: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Total spent {period === 'week' ? 'this week' : 'this month'}
                            </span>
                            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>
                                ₹{data.grandTotal.toFixed(2)}
                            </span>
                        </div>

                        {/* Category Breakdown */}
                        {categories.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                                No expenses recorded for this period.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {categories.map(([cat, amount]) => {
                                    const pct = Math.round((amount / data.grandTotal) * 100);
                                    const barWidth = Math.round((amount / maxAmount) * 100);
                                    const color = CATEGORY_COLORS[cat] || '#6b7280';
                                    return (
                                        <div key={cat}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        width: '10px', height: '10px', borderRadius: '50%',
                                                        background: color, display: 'inline-block', flexShrink: 0
                                                    }} />
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{cat}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{pct}%</span>
                                                </div>
                                                <span style={{ color, fontWeight: 700, fontSize: '0.95rem' }}>₹{amount.toFixed(2)}</span>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${barWidth}%`,
                                                    height: '100%',
                                                    background: `linear-gradient(90deg, ${color}, ${color}99)`,
                                                    borderRadius: '6px',
                                                    transition: 'width 0.6s ease'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '20px', textAlign: 'center' }}>
                            {data.startDate} → {data.endDate}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsModal;
