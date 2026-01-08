import React, { useState } from 'react';

const SpentMoneySection = ({ spentList, onAddItem, onDeleteItem }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const handleAdd = () => {
        const amountNum = parseFloat(amount);
        if (!description || isNaN(amountNum) || amountNum <= 0) {
            alert('Please enter a valid description and amount');
            return;
        }
        onAddItem({ description, amount: amountNum });
        setDescription('');
        setAmount('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
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
                <button onClick={handleAdd}>Add</button>
            </div>

            <div className="spent-list">
                {spentList.map((item, index) => (
                    <div key={index} className="spent-item">
                        <span className="spent-item-text">{item.description}</span>
                        <span className="spent-item-amount">₹{item.amount.toFixed(2)}</span>
                        <button
                            className="delete-item-btn"
                            onClick={() => onDeleteItem(index)}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            <div className="total-spent">
                <strong>Total: ₹{total.toFixed(2)}</strong>
            </div>
        </div>
    );
};

export default SpentMoneySection;
