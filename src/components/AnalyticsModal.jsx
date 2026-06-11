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

const CATEGORY_ICONS = {
    Food:          '🍽️',
    Groceries:     '🛒',
    Transport:     '🚗',
    Clothing:      '👗',
    Entertainment: '🎬',
    Health:        '💊',
    Education:     '📚',
    Utilities:     '💡',
    Shopping:      '🛍️',
    Travel:        '✈️',
    Other:         '📦',
};

/* ── Format date nicely ── */
const fmtDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

/* ── Drill-down panel ── */
const DrillDown = ({ category, period, color, onBack }) => {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.analyticsCategory(period, category)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [category, period]);

    return (
        <div>
            {/* Back + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '50%',
                        width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#f0f2ff', fontSize: '1rem',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                    }}
                    title="Back"
                >
                    ←
                </button>
                <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: color, display: 'inline-block', flexShrink: 0,
                }} />
                <h3 style={{ color: '#f0f2ff', fontSize: '1.15rem', fontWeight: 700 }}>
                    {CATEGORY_ICONS[category] || '📦'} {category} — Details
                </h3>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3c4' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                    Loading…
                </div>
            )}

            {!loading && data && (
                <>
                    {/* Category total pill */}
                    <div style={{
                        background: `${color}18`,
                        border: `1px solid ${color}44`,
                        borderRadius: 10,
                        padding: '12px 18px',
                        marginBottom: 18,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{ color: '#9ca3c4', fontSize: '0.85rem' }}>Total in period</span>
                        <span style={{ color, fontWeight: 800, fontSize: '1.4rem' }}>₹{data.total.toFixed(2)}</span>
                    </div>

                    {data.byDate.length === 0 ? (
                        <p style={{ color: '#9ca3c4', textAlign: 'center', padding: 20 }}>
                            No {category} expenses recorded for this period.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {data.byDate.map(day => (
                                <div key={day.date} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                }}>
                                    {/* Day header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 16px',
                                        background: `${color}12`,
                                        borderBottom: `1px solid ${color}28`,
                                    }}>
                                        <span style={{ color: '#f0f2ff', fontWeight: 600, fontSize: '0.9rem' }}>
                                            📅 {fmtDate(day.date)}
                                        </span>
                                        <span style={{ color, fontWeight: 700, fontSize: '0.9rem' }}>
                                            ₹{day.dayTotal.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    {day.items.map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '9px 16px',
                                            borderBottom: idx < day.items.length - 1
                                                ? '1px solid rgba(255,255,255,0.05)'
                                                : 'none',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{
                                                    width: 6, height: 6, borderRadius: '50%',
                                                    background: color, flexShrink: 0,
                                                }} />
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <span style={{ color: '#d1d5db', fontSize: '0.88rem' }}>
                                                        {item.description}
                                                    </span>
                                                    {item.createdAt ? (
                                                        <span style={{ color: '#5a6080', fontSize: '0.75rem' }}>
                                                            🕐 {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#5a6080', fontSize: '0.75rem' }}>🕐 time not recorded</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span style={{ color: '#38d9c0', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
                                                ₹{item.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {!loading && !data && (
                <p style={{ color: '#f05252', textAlign: 'center', padding: 20 }}>
                    Failed to load details. Please try again.
                </p>
            )}
        </div>
    );
};

/* ── Main Modal ── */
const AnalyticsModal = ({ isOpen, onClose }) => {
    const [period, setPeriod]           = useState('month');
    const [data, setData]               = useState(null);
    const [loading, setLoading]         = useState(false);
    const [activeCategory, setActiveCategory] = useState(null); // drill-down state

    const loadAnalytics = async (p) => {
        setLoading(true);
        setActiveCategory(null);
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

    // Reset drill-down when modal closes
    useEffect(() => {
        if (!isOpen) setActiveCategory(null);
    }, [isOpen]);

    if (!isOpen) return null;

    const categories = data
        ? Object.entries(data.categoryTotals).sort((a, b) => b[1] - a[1])
        : [];
    const maxAmount = categories.length > 0 ? categories[0][1] : 1;

    return (
        <div className="modal" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '600px', height: 'auto', maxHeight: '85vh', overflowY: 'auto' }}
            >
                <span className="close" onClick={onClose}>&times;</span>

                {/* Show drill-down or overview */}
                {activeCategory ? (
                    <DrillDown
                        category={activeCategory}
                        period={period}
                        color={CATEGORY_COLORS[activeCategory] || '#6b7280'}
                        onBack={() => setActiveCategory(null)}
                    />
                ) : (
                    <>
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
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    This {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>

                        {loading && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
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
                                    alignItems: 'center',
                                }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Total spent {period === 'week' ? 'this week' : 'this month'}
                                    </span>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>
                                        ₹{data.grandTotal.toFixed(2)}
                                    </span>
                                </div>

                                {/* Hint */}
                                {categories.length > 0 && (
                                    <p style={{ color: '#5a6080', fontSize: '0.78rem', marginBottom: 14, textAlign: 'right' }}>
                                        👆 Click a category to see details
                                    </p>
                                )}

                                {/* Category Breakdown */}
                                {categories.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                                        No expenses recorded for this period.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {categories.map(([cat, amount]) => {
                                            const pct      = Math.round((amount / data.grandTotal) * 100);
                                            const barWidth = Math.round((amount / maxAmount) * 100);
                                            const color    = CATEGORY_COLORS[cat] || '#6b7280';
                                            return (
                                                <div
                                                    key={cat}
                                                    onClick={() => setActiveCategory(cat)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '12px 14px',
                                                        borderRadius: 10,
                                                        border: '1px solid rgba(255,255,255,0.06)',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        transition: 'background 0.18s, border-color 0.18s, transform 0.15s',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = `${color}14`;
                                                        e.currentTarget.style.borderColor = `${color}44`;
                                                        e.currentTarget.style.transform = 'translateX(3px)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                                        e.currentTarget.style.transform = 'translateX(0)';
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '1rem' }}>{CATEGORY_ICONS[cat] || '📦'}</span>
                                                            <span style={{
                                                                width: '10px', height: '10px', borderRadius: '50%',
                                                                background: color, display: 'inline-block', flexShrink: 0,
                                                            }} />
                                                            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                                                                {cat}
                                                            </span>
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{pct}%</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ color, fontWeight: 700, fontSize: '0.95rem' }}>
                                                                ₹{amount.toFixed(2)}
                                                            </span>
                                                            <span style={{ color: '#5a6080', fontSize: '0.8rem' }}>›</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${barWidth}%`,
                                                            height: '100%',
                                                            background: `linear-gradient(90deg, ${color}, ${color}99)`,
                                                            borderRadius: '6px',
                                                            transition: 'width 0.6s ease',
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
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsModal;
