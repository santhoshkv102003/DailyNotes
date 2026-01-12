import React, { useState, useEffect, useContext } from 'react';
import Header from './components/Header';
import SpentMoneySection from './components/SpentMoneySection';
import NotesSection from './components/NotesSection';
import ActionButtons from './components/ActionButtons';
import HistoryModal from './components/HistoryModal';
import Login from './components/Login';
import Register from './components/Register';
import { api } from './api';
import { AuthProvider, AuthContext } from './context/AuthContext';

function AuthenticatedApp() {
  const { user, logout } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState('');
  const [spentList, setSpentList] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // History Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [historyData, setHistoryData] = useState(null);

  // Helper to format date like "Wednesday, September 10, 2025"
  const getFormattedDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to get YYYY-MM-DD for API keys
  const getDateKey = (dateObj) => {
    return dateObj.toISOString().split('T')[0];
  };

  // Initialize
  useEffect(() => {
    const today = new Date();
    setCurrentDate(getFormattedDate(today));
    setModalDate(getDateKey(today)); // Default modal date to today
  }, []);

  const loadDataForKey = async (key) => {
    try {
      const data = await api.getDay(key);
      setNotes(data.notes || '');
      setSpentList(data.spentMoney || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setNotes('');
      setSpentList([]);
    }
  };

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

      // Clear form after save
      setNotes('');
      setSpentList([]);

      // Revert success message after 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data!');
    }
  };

  // Modal Handlers
  const handleHistoryOpen = () => {
    setIsModalOpen(true);
    // Auto-load currently selected modal date data
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

        // If deleting today's data, also clear main view
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

        // Update local state
        setHistoryData({
          ...historyData,
          spentMoney: newSpent
        });
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  // Create min/max dates
  const [minDate, setMinDate] = useState('');
  const maxDate = getDateKey(new Date());

  // Find earliest date via API
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const dates = await api.getAllDates();
        if (dates && dates.length > 0) {
          setMinDate(dates[0]); // Dates are sorted from API
        } else {
          setMinDate(getDateKey(new Date()));
        }
      } catch (error) {
        console.error('Error fetching dates:', error);
      }
    };

    if (isModalOpen) {
      fetchDates();
    }
  }, [isModalOpen]);

  // Auto-load history when modalDate changes, if modal is open
  useEffect(() => {
    if (isModalOpen && modalDate) {
      loadHistoryDataForDate(modalDate);
    }
  }, [modalDate, isModalOpen]);


  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 30px 0 30px', color: '#666' }}>
        <span>Welcome, <strong>{user?.username}</strong></span>
        <button onClick={logout} style={{
          background: 'none',
          border: 'none',
          color: '#667eea',
          cursor: 'pointer',
          fontWeight: '600',
          textDecoration: 'underline'
        }}>Logout</button>
      </div>

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
    </div>
  );
}

function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>;
  }

  if (!user) {
    return isRegistering
      ? <Register onSwitch={() => setIsRegistering(false)} />
      : <Login onSwitch={() => setIsRegistering(true)} />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
export default App; // Ensure this is exported correctly
