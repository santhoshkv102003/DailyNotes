import React, { useState } from 'react';

const HistoryModal = ({ isOpen, onClose, onLoadHistory, onDeleteHistory, onDeleteItem, historyData, selectedDate, onDateChange, minDate, maxDate }) => {
    if (!isOpen) return null;



    const handleDelete = () => {
        onDeleteHistory();
    };

    // State for animation direction
    const [animationClass, setAnimationClass] = useState('');
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);

    // Reset selection when date changes
    React.useEffect(() => {
        setSelectedItemIndex(null);
    }, [selectedDate, historyData]);

    // Helper to change date by offset
    const changeDateBy = (offset) => {
        if (!selectedDate) return;
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + offset);
        const newDateStr = date.toISOString().split('T')[0];

        // Check bounds
        if (minDate && newDateStr < minDate) return;
        if (maxDate && newDateStr > maxDate) return;

        // Set animation direction
        // If offset > 0 (Next Day), we flip in like a new page (flip-next)
        // If offset < 0 (Prev Day), we flip back (flip-prev)
        setAnimationClass(offset > 0 ? 'flip-next' : 'flip-prev');

        // Reset animation class after it plays (600ms matches CSS)
        setTimeout(() => setAnimationClass(''), 600);

        onDateChange(newDateStr);
    };

    // Keyboard Navigation
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                changeDateBy(-1);
            } else if (e.key === 'ArrowRight') {
                changeDateBy(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedDate, minDate, maxDate]);

    // Swipe Navigation
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Swiped Left -> Next Day (User wants to see future)
            changeDateBy(1);
        } else if (isRightSwipe) {
            // Swiped Right -> Previous Day (User wants to see past)
            changeDateBy(-1);
        }
    };


    // Helper to render notes with bullets
    const renderNotes = (notesText) => {
        if (!notesText) return <p>No notes for this date</p>;
        const lines = notesText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return <p>No notes for this date</p>;

        return lines.map((line, idx) => (
            <p key={idx} style={{ margin: '8px 0', paddingLeft: '10px' }}>{line.trim()}</p>
        ));
    };

    // Helper to render spent list
    const renderSpent = (spentList) => {
        if (!spentList || spentList.length === 0) return 'No expenses recorded for this date';

        const total = spentList.reduce((sum, item) => sum + item.amount, 0);

        return (
            <>
                {spentList.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: '10px',
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: idx === selectedItemIndex ? '#e6f7ff' : 'transparent',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s'
                        }}
                        onClick={() => setSelectedItemIndex(idx === selectedItemIndex ? null : idx)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span><strong>{idx + 1}.</strong> {item.description}</span>
                            <strong style={{ color: '#667eea' }}>₹{item.amount.toFixed(2)}</strong>
                        </div>
                    </div>
                ))}
                <div style={{ padding: '10px', marginTop: '10px', borderTop: '2px solid #667eea' }}>
                    <strong>Total: ₹{total.toFixed(2)}</strong>
                </div>
            </>
        );
    };

    const isPrevDisabled = minDate && selectedDate <= minDate;
    const isNextDisabled = maxDate && selectedDate >= maxDate;

    return (
        <div className="modal" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <span className="close" onClick={onClose}>&times;</span>

                <div className="date-navigation">
                    <button
                        className="nav-btn prev-btn"
                        onClick={() => changeDateBy(-1)}
                        disabled={isPrevDisabled}
                        aria-label="Previous Day"
                    >
                        &#8592;
                    </button>

                    <div className="date-selector">
                        <h2>Select Date</h2>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            min={minDate}
                            max={maxDate}
                        />
                    </div>

                    <button
                        className="nav-btn next-btn"
                        onClick={() => changeDateBy(1)}
                        disabled={isNextDisabled}
                        aria-label="Next Day"
                    >
                        &#8594;
                    </button>
                </div>

                <div className={`previous-info ${animationClass}`}>
                    <div className="info-box">
                        <h3>Notes</h3>
                        <div className="previous-content">
                            {historyData ? renderNotes(historyData.notes) : <p>No data loaded (or no notes)</p>}
                        </div>
                    </div>
                    <div className="info-box">
                        <h3>Spent Money</h3>
                        <div className="previous-content">
                            {historyData ? renderSpent(historyData.spentMoney) : 'No data loaded'}
                        </div>
                    </div>
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    {selectedItemIndex !== null && (
                        <button
                            className="delete-btn"
                            onClick={() => onDeleteItem(selectedItemIndex)}
                            style={{
                                backgroundColor: '#e12424ff'
                            }}
                        >
                            Remove Item
                        </button>
                    )}
                    <button className="delete-btn" onClick={handleDelete} style={{ backgroundColor: '#ac0f0fff' }}>Clear All</button>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
