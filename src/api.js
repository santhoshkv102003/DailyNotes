const API_BASE = '/api';

export const api = {
    // Get entry for a specific date
    getDay: async (date) => {
        const response = await fetch(`${API_BASE}/days/${date}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },

    // Save (Upsert) entry
    saveDay: async (date, notes, spentMoney, mode = 'overwrite') => {
        const response = await fetch(`${API_BASE}/days`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, notes, spentMoney, mode })
        });
        if (!response.ok) throw new Error('Failed to save data');
        return response.json();
    },

    // Delete entry
    deleteDay: async (date) => {
        const response = await fetch(`${API_BASE}/days/${date}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete data');
        return response.json();
    },

    // Get all dates (for min/max logic)
    getAllDates: async () => {
        const response = await fetch(`${API_BASE}/days/range/all`);
        if (!response.ok) throw new Error('Failed to fetch dates range');
        return response.json();
    }
};
