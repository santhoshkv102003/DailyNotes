import React, { useState } from 'react';
import { api } from '../api';
import { useCurrency } from '../hooks/useCurrency';

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

const SpentMoneySection = ({ spentList, onAddItem, onDeleteItem }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [categorizing, setCategorizing] = useState(false);
    const currency = useCurrency();

    const handleAdd = async () => {
        const amountNum = parseFloat(amount);
        if (!description || isNaN(amountNum) || amountNum <= 0) {
            alert('Please enter a valid description and amount');
            return;
        }

        setCategorizing(true);
        let category = 'Other';
        try {
            const result = await api.categorize(description);
            category = result.category || 'Other';
        } catch {
            category = 'Other';
        }
        setCategorizing(false);

        onAddItem({ description, amount: amountNum, category, createdAt: new Date().toISOString() });
        setDescription('');
        setAmount('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleAdd();
    };

    const total = spentList.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="spent-money-section">
            <h2>Spent Money</h2>
            <div className="add-item">
                <input
                    type="number"
                    placeholder="Amount"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleAdd} disabled={categorizing}>
                    {categorizing ? '...' : 'Add'}
                </button>
            </div>

            <div className="spent-list">
                {spentList.map((item, index) => (
                    <div key={index} className="spent-item">
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '3px' }}>
                            <span className="spent-item-text">{item.description}</span>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                {item.category && (
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        color: CATEGORY_COLORS[item.category] || '#6b7280',
                                        background: `${CATEGORY_COLORS[item.category] || '#6b7280'}18`,
                                        border: `1px solid ${CATEGORY_COLORS[item.category] || '#6b7280'}40`,
                                        borderRadius: '10px',
                                        padding: '1px 8px',
                                        width: 'fit-content'
                                    }}>
                                        {item.category}
                                    </span>
                                )}
                                {item.createdAt && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: '#5a6080',
                                    }}>
                                        🕐 {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="spent-item-amount">{currency}{item.amount.toFixed(2)}</span>
                        <button className="delete-item-btn" onClick={() => onDeleteItem(index)}>Delete</button>
                    </div>
                ))}
            </div>

            <div className="total-spent">
                <strong>Total: {currency}{total.toFixed(2)}</strong>
            </div>
        </div>
    );
};

export default SpentMoneySection;
