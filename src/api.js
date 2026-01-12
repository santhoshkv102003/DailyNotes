const API_BASE = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    // Auth
    register: async (username, password) => {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Registration failed');
        return data; // { token, user }
    },

    login: async (username, password) => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Login failed');
        return data; // { token, user }
    },

    // Get entry for a specific date
    getDay: async (date) => {
        const response = await fetch(`${API_BASE}/days/${date}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },

    // Save (Upsert) entry
    saveDay: async (date, notes, spentMoney, mode = 'overwrite') => {
        const response = await fetch(`${API_BASE}/days`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ date, notes, spentMoney, mode })
        });
        if (!response.ok) throw new Error('Failed to save data');
        return response.json();
    },

    // Delete entry
    deleteDay: async (date) => {
        const response = await fetch(`${API_BASE}/days/${date}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete data');
        return response.json();
    },

    // Get all dates (for min/max logic)
    getAllDates: async () => {
        const response = await fetch(`${API_BASE}/days/range/all`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch dates range');
        return response.json();
    }
};
