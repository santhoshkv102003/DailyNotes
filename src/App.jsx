import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SpentMoneySection from './components/SpentMoneySection';
import NotesSection from './components/NotesSection';
import ActionButtons from './components/ActionButtons';
import HistoryModal from './components/HistoryModal';
import AnalyticsModal from './components/AnalyticsModal';
import SearchModal from './components/SearchModal';
import AIChatSidebar from './components/AIChatSidebar';
import SpendingGraphModal from './components/SpendingGraphModal';
import { api } from './api';

function App() {
  const [currentDate, setCurrentDate] = useState('');
  const [spentList, setSpentList] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // History Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [historyData, setHistoryData] = useState(null);

  // AI Modals State
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  const getFormattedDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateKey = (dateObj) => {
    return dateObj.toISOString().split('T')[0];
  };

  useEffect(() => {
    const today = new Date();
    setCurrentDate(getFormattedDate(today));
    setModalDate(getDateKey(today));
  }, []);

  const handleAddItem = (item) => {
    setSpentList([...spentList, item]);
    setIsSaved(false);
  };

  const handleDeleteItem = (index) => {
    const newList = [...spentList];
    newList.splice(index, 1);
    setSpentList(newList);
    setIsSaved(false);
  };

  const handleSave = async () => {
    const today = new Date();
    const key = getDateKey(today);
    try {
      await api.saveDay(key, notes, spentList, 'append');
      setIsSaved(true);
      setNotes('');
      setSpentList([]);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data!');
    }
  };

  const handleHistoryOpen = () => {
    setIsModalOpen(true);
    loadHistoryDataForDate(modalDate);
  };

  const loadHistoryDataForDate = async (dateStr) => {
    if (!dateStr) return;
    try {
      const data = await api.getDay(dateStr);
      setHistoryData(data);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistoryData(null);
    }
  };

  const handleDeleteHistory = async () => {
    if (!modalDate) return;
    if (window.confirm('Are you sure you want to delete the data for this date?')) {
      try {
        await api.deleteDay(modalDate);
        setHistoryData(null);
        const todayKey = getDateKey(new Date());
        if (modalDate === todayKey) {
          setNotes('');
          setSpentList([]);
        }
        alert('Data deleted successfully');
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Failed to delete data');
      }
    }
  };

  const handleHistoryItemDelete = async (index) => {
    if (!historyData || !modalDate) return;
    if (window.confirm('Delete this item?')) {
      const newSpent = [...historyData.spentMoney];
      newSpent.splice(index, 1);
      try {
        await api.saveDay(modalDate, historyData.notes, newSpent, 'overwrite');
        setHistoryData({ ...historyData, spentMoney: newSpent });
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const [minDate, setMinDate] = useState('');
  const maxDate = getDateKey(new Date());

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const dates = await api.getAllDates();
        setMinDate(dates && dates.length > 0 ? dates[0] : getDateKey(new Date()));
      } catch (error) {
        console.error('Error fetching dates:', error);
      }
    };
    if (isModalOpen) fetchDates();
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && modalDate) loadHistoryDataForDate(modalDate);
  }, [modalDate, isModalOpen]);

  return (
    <div className="container">
      <Header date={currentDate} />

      <div className="main-content">
        <div className="left-section">
          <SpentMoneySection
            spentList={spentList}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        </div>
        <div className="right-section">
          <NotesSection
            notes={notes}
            setNotes={val => { setNotes(val); setIsSaved(false); }}
          />
        </div>
      </div>

      <ActionButtons
        onSave={handleSave}
        onHistory={handleHistoryOpen}
        isSaved={isSaved}
        onAnalytics={() => setIsAnalyticsOpen(true)}
        onSearch={() => setIsSearchOpen(true)}
        onAIChat={() => setIsAIChatOpen(true)}
        onGraph={() => setIsGraphOpen(true)}
      />

      <HistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={modalDate}
        onDateChange={(date) => setModalDate(date)}
        onLoadHistory={() => loadHistoryDataForDate(modalDate)}
        onDeleteHistory={handleDeleteHistory}
        onDeleteItem={handleHistoryItemDelete}
        historyData={historyData}
        minDate={minDate}
        maxDate={maxDate}
      />
      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AIChatSidebar isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <SpendingGraphModal isOpen={isGraphOpen} onClose={() => setIsGraphOpen(false)} />
    </div>
  );
}

export default App;
