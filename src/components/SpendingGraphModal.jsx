import React, { useEffect, useState, useCallback } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from 'recharts';
import { api } from '../api';
import { useCurrency } from '../hooks/useCurrency';

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label, currency }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background: '#1a1d2e',
            border: '1px solid rgba(124,106,247,0.4)',
            borderRadius: '10px',
            padding: '10px 16px',
            color: '#f0f2ff',
            fontSize: '0.88rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
            <p style={{ color: '#9ca3c4', marginBottom: 4 }}>{label}</p>
            <p style={{ color: '#38d9c0', fontWeight: 700 }}>
                {currency}{payload[0].value.toFixed(2)}
            </p>
        </div>
    );
};

/* ── Helper: last N days date range ── */
const getDateRange = (days) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const RANGE_OPTIONS = [
    { label: '7 Days',  value: 7 },
    { label: '14 Days', value: 14 },
    { label: '30 Days', value: 30 },
];

const SpendingGraphModal = ({ isOpen, onClose }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading]     = useState(false);
    const [range, setRange]         = useState(7);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [yMax, setYMax]           = useState(3000);
    const [yInput, setYInput]       = useState('3000');
    const currency = useCurrency();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const dates = getDateRange(range);
            // Fetch all days in parallel
            const results = await Promise.all(
                dates.map(date =>
                    api.getDay(date).then(data => ({
                        date,
                        label: new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                        }),
                        total: data?.spentMoney
                            ? data.spentMoney.reduce((s, i) => s + (i.amount || 0), 0)
                            : 0,
                    })).catch(() => ({
                        date,
                        label: new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                        }),
                        total: 0,
                    }))
                )
            );
            setChartData(results);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Graph load error:', err);
        } finally {
            setLoading(false);
        }
    }, [range]);

    // Load on open and when range changes
    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen, loadData]);

    // Live refresh every 30 seconds while open
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(loadData, 30_000);
        return () => clearInterval(interval);
    }, [isOpen, loadData]);

    if (!isOpen) return null;

    const maxTotal = Math.max(...chartData.map(d => d.total), 0);
    const avgTotal = chartData.length
        ? chartData.reduce((s, d) => s + d.total, 0) / chartData.length
        : 0;
    const todayTotal = chartData.at(-1)?.total ?? 0;

    return (
        <div className="modal" onClick={onClose}>
            <div
                className="modal-content graph-modal-content"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '900px', width: '90vw', height: '80vh' }}
            >
                <span className="close" onClick={onClose}>&times;</span>

                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <h2 style={{
                        fontSize: '1.4rem', fontWeight: 700,
                        background: 'linear-gradient(135deg,#fff 30%,#7c6af7 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text', marginBottom: 4,
                    }}>
                        📈 Spending Graph
                    </h2>
                    <p style={{ color: '#9ca3c4', fontSize: '0.85rem' }}>
                        {lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s` : 'Loading...'}
                    </p>
                </div>

                {/* Range selector + Refresh */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {RANGE_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setRange(opt.value)}
                            style={{
                                padding: '8px 18px',
                                borderRadius: '20px',
                                border: range === opt.value
                                    ? '1px solid #7c6af7'
                                    : '1px solid rgba(255,255,255,0.1)',
                                background: range === opt.value
                                    ? 'rgba(124,106,247,0.25)'
                                    : 'rgba(255,255,255,0.04)',
                                color: range === opt.value ? '#7c6af7' : '#9ca3c4',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                    <button
                        onClick={loadData}
                        disabled={loading}
                        style={{
                            marginLeft: 'auto',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            border: '1px solid rgba(56,217,192,0.3)',
                            background: 'rgba(56,217,192,0.1)',
                            color: '#38d9c0',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? '⟳ Loading…' : '⟳ Refresh'}
                    </button>
                </div>

                {/* Y-axis max customiser */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <span style={{ color: '#9ca3c4', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Y-axis max ({currency}):</span>
                    <input
                        type="number"
                        min={100}
                        max={100000}
                        step={100}
                        value={yInput}
                        onChange={e => setYInput(e.target.value)}
                        onBlur={() => {
                            const val = parseInt(yInput, 10);
                            if (!isNaN(val) && val >= 100) setYMax(val);
                            else setYInput(String(yMax));
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                const val = parseInt(yInput, 10);
                                if (!isNaN(val) && val >= 100) setYMax(val);
                                else setYInput(String(yMax));
                            }
                        }}
                        style={{
                            width: 110,
                            padding: '7px 12px',
                            background: '#12151f',
                            border: '1px solid rgba(124,106,247,0.35)',
                            borderRadius: '8px',
                            color: '#f0f2ff',
                            fontSize: '0.88rem',
                            outline: 'none',
                        }}
                    />
                    {/* Quick presets */}
                    {[1000, 3000, 5000, 10000].map(preset => (
                        <button
                            key={preset}
                            onClick={() => { setYMax(preset); setYInput(String(preset)); }}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '16px',
                                border: yMax === preset
                                    ? '1px solid #38d9c0'
                                    : '1px solid rgba(255,255,255,0.1)',
                                background: yMax === preset
                                    ? 'rgba(56,217,192,0.18)'
                                    : 'rgba(255,255,255,0.04)',
                                color: yMax === preset ? '#38d9c0' : '#9ca3c4',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {preset >= 1000 ? `${preset / 1000}k` : preset}
                        </button>
                    ))}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    {[
                        { label: "Today's Spend", value: `${currency}${todayTotal.toFixed(2)}`, color: '#38d9c0' },
                        { label: 'Daily Average',  value: `${currency}${avgTotal.toFixed(2)}`,   color: '#7c6af7' },
                        { label: 'Highest Day',    value: `${currency}${maxTotal.toFixed(2)}`,   color: '#eab308' },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            flex: '1 1 120px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            padding: '14px 18px',
                            minWidth: 100,
                        }}>
                            <p style={{ color: '#9ca3c4', fontSize: '0.75rem', marginBottom: 4 }}>{stat.label}</p>
                            <p style={{ color: stat.color, fontWeight: 700, fontSize: '1.2rem' }}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div style={{ flex: 1, minHeight: 0 }}>
                    {loading && chartData.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3c4' }}>
                            <div className="loading-spinner" style={{ marginRight: 12 }} /> Loading data…
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#7c6af7" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#7c6af7" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: '#9ca3c4', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    tickLine={false}
                                />

                                <YAxis
                                    domain={[0, yMax]}
                                    ticks={Array.from({ length: 6 }, (_, i) => Math.round((yMax / 5) * i))}
                                    tickFormatter={v => `${currency}${v >= 1000 ? (v / 1000) + 'k' : v}`}
                                    tick={{ fill: '#9ca3c4', fontSize: 11 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    tickLine={false}
                                    width={55}
                                />

                                <Tooltip content={<CustomTooltip currency={currency} />} />

                                {/* Average reference line */}
                                {avgTotal > 0 && (
                                    <ReferenceLine
                                        y={avgTotal}
                                        stroke="#eab308"
                                        strokeDasharray="6 3"
                                        label={{ value: 'Avg', fill: '#eab308', fontSize: 11, position: 'insideTopRight' }}
                                    />
                                )}

                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#7c6af7"
                                    strokeWidth={2.5}
                                    fill="url(#spendGradient)"
                                    dot={{ fill: '#7c6af7', r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: '#38d9c0', strokeWidth: 0 }}
                                    animationDuration={600}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpendingGraphModal;
