const API_BASE = '/api';

const jsonHeaders = { 'Content-Type': 'application/json' };

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
            headers: jsonHeaders,
            body: JSON.stringify({ date, notes, spentMoney, mode })
        });
        if (!response.ok) throw new Error('Failed to save data');
        return response.json();
    },

    // Delete entry
    deleteDay: async (date) => {
        const response = await fetch(`${API_BASE}/days/${date}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete data');
        return response.json();
    },

    // Get all dates
    getAllDates: async () => {
        const response = await fetch(`${API_BASE}/days/range/all`);
        if (!response.ok) throw new Error('Failed to fetch dates');
        return response.json();
    },

    // AI: categorize expense
    categorize: async (description) => {
        const response = await fetch(`${API_BASE}/ai/categorize`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ description })
        });
        if (!response.ok) return { category: 'Other' };
        return response.json();
    },

    // AI: fix grammar
    fixGrammar: async (text) => {
        const response = await fetch(`${API_BASE}/ai/fix-grammar`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Grammar fix failed');
        return data;
    },

    // AI: search
    search: async (query) => {
        const response = await fetch(`${API_BASE}/ai/search`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ query })
        });
        if (!response.ok) throw new Error('Search failed');
        return response.json();
    },

    // AI: chat
    chat: async (message, history) => {
        const response = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ message, history })
        });
        if (!response.ok) throw new Error('Chat failed');
        return response.json();
    },

    // Analytics
    analytics: async (period = 'month') => {
        const response = await fetch(`${API_BASE}/ai/analytics?period=${period}`);
        if (!response.ok) throw new Error('Analytics failed');
        return response.json();
    }
};
