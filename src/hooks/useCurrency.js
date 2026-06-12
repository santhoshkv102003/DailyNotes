import { useAuth } from '../context/AuthContext';

const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    AED: 'د.إ',
    CHF: 'Fr',
};

/**
 * Returns the currency symbol for the logged-in user.
 * Falls back to '₹' if no currency is set.
 */
export const useCurrency = () => {
    const { user } = useAuth();
    return CURRENCY_SYMBOLS[user?.currency] || '₹';
};
