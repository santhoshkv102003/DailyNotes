const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const DayEntry = require('../models/DayEntry');
const auth = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper: single call to Groq
const ask = async (prompt, systemPrompt = 'You are a helpful assistant.') => {
    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1024,
    });
    return completion.choices[0].message.content.trim();
};

// POST /api/ai/categorize
router.post('/categorize', auth, async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.json({ category: 'Other' });

        const text = await ask(
            `Categorize this expense: "${description}"\n\nReply with ONLY one word from: Food, Groceries, Transport, Clothing, Entertainment, Health, Education, Utilities, Shopping, Travel, Other`,
            'You are an expense categorizer. Reply with only the category name, nothing else.'
        );

        const valid = ['Food','Groceries','Transport','Clothing','Entertainment','Health','Education','Utilities','Shopping','Travel','Other'];
        const category = valid.find(c => text.toLowerCase().includes(c.toLowerCase())) || 'Other';
        res.json({ category });
    } catch (err) {
        console.error('Categorize error:', err.message);
        res.json({ category: 'Other' });
    }
});

// POST /api/ai/fix-grammar
router.post('/fix-grammar', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) return res.json({ fixed: text });

        const fixed = await ask(
            `Fix the grammar, spelling and punctuation of this text. Keep the same meaning, tone and structure. Return ONLY the corrected text, nothing else:\n\n${text}`,
            'You are a grammar correction assistant. Return only the corrected text, no explanations.'
        );

        res.json({ fixed: fixed.replace(/^"|"$/g, '') });
    } catch (err) {
        console.error('Grammar error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/ai/search
router.post('/search', auth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.json({ results: [], answer: '' });

        const allEntries = await DayEntry.find({ userId: req.user.userId }).sort({ date: 1 });
        if (allEntries.length === 0) return res.json({ results: [], answer: 'No diary entries found.' });

        const summaries = allEntries.map(e => {
            const spent = e.spentMoney.map(s => `${s.description}(Rs.${s.amount},${s.category || 'Other'})`).join(', ');
            return `[${e.date}] Notes: ${e.notes || 'none'} | Spent: ${spent || 'none'}`;
        }).join('\n');

        const text = await ask(
            `DIARY ENTRIES:\n${summaries}\n\nQUESTION: "${query}"\n\nReturn ONLY a valid JSON object like this (no markdown, no extra text):\n{"answer": "friendly answer here", "matchedDates": ["YYYY-MM-DD"]}`,
            'You are a diary search assistant. Always respond with valid JSON only. No markdown code blocks.'
        );

        let parsed;
        try {
            const clean = text.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```$/i,'').trim();
            parsed = JSON.parse(clean);
        } catch {
            parsed = { answer: text, matchedDates: [] };
        }

        const results = (parsed.matchedDates || [])
            .map(date => allEntries.find(e => e.date === date))
            .filter(Boolean);

        res.json({ answer: parsed.answer, results });
    } catch (err) {
        console.error('Search error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.json({ reply: 'Please ask me something.' });

        const allEntries = await DayEntry.find({ userId: req.user.userId }).sort({ date: 1 });
        const today = new Date().toISOString().split('T')[0];

        const summaries = allEntries.map(e => {
            const spent = e.spentMoney.map(s => `${s.description}: Rs.${s.amount} [${s.category || 'Other'}]`).join(', ');
            const total = e.spentMoney.reduce((sum, s) => sum + s.amount, 0);
            return `${e.date} | Notes: ${e.notes || 'none'} | Expenses: ${spent || 'none'} | Total: Rs.${total}`;
        }).join('\n');

        const catTotals = {};
        allEntries.forEach(e => e.spentMoney.forEach(s => {
            const c = s.category || 'Other';
            catTotals[c] = (catTotals[c] || 0) + s.amount;
        }));
        const catStr = Object.entries(catTotals).map(([k, v]) => `${k}: Rs.${v.toFixed(2)}`).join(', ');

        // Build messages array with history for proper multi-turn chat
        const messages = [
            {
                role: 'system',
                content: `You are a smart personal diary and expense assistant. Today is ${today}.

DIARY DATA:
${summaries || 'No entries yet'}

CATEGORY TOTALS:
${catStr || 'No expenses recorded'}

Answer helpfully using actual data from the diary. For "last week" filter last 7 days. For "this month" filter current month. Be concise and friendly. Use Rs. for currency.`
            },
            ...(history || []).map(h => ({ role: h.role, content: h.text })),
            { role: 'user', content: message }
        ];

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.4,
            max_tokens: 1024,
        });

        res.json({ reply: completion.choices[0].message.content.trim() });
    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/ai/analytics?period=week|month
router.get('/analytics', auth, async (req, res) => {
    try {
        const { period } = req.query;
        const today = new Date();
        let startDate;

        if (period === 'week') {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
        } else {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        }

        const startStr = startDate.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        const entries = await DayEntry.find({
            userId: req.user.userId,
            date: { $gte: startStr, $lte: todayStr }
        }).sort({ date: 1 });

        const categoryTotals = {};
        const dailyTotals = {};
        let grandTotal = 0;

        entries.forEach(e => {
            dailyTotals[e.date] = dailyTotals[e.date] || 0;
            e.spentMoney.forEach(s => {
                const cat = s.category || 'Other';
                categoryTotals[cat] = (categoryTotals[cat] || 0) + s.amount;
                dailyTotals[e.date] += s.amount;
                grandTotal += s.amount;
            });
        });

        res.json({ categoryTotals, dailyTotals, grandTotal, period, startDate: startStr, endDate: todayStr });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
