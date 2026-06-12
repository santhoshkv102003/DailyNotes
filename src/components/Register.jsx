import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CURRENCIES = [
    { code: 'INR', symbol: '₹', label: 'INR — Indian Rupee' },
    { code: 'USD', symbol: '$', label: 'USD — US Dollar' },
    { code: 'EUR', symbol: '€', label: 'EUR — Euro' },
    { code: 'GBP', symbol: '£', label: 'GBP — British Pound' },
    { code: 'JPY', symbol: '¥', label: 'JPY — Japanese Yen' },
    { code: 'AUD', symbol: 'A$', label: 'AUD — Australian Dollar' },
    { code: 'CAD', symbol: 'C$', label: 'CAD — Canadian Dollar' },
    { code: 'SGD', symbol: 'S$', label: 'SGD — Singapore Dollar' },
    { code: 'AED', symbol: 'د.إ', label: 'AED — UAE Dirham' },
    { code: 'CHF', symbol: 'Fr', label: 'CHF — Swiss Franc' },
];

const Register = ({ onSwitch }) => {
    const { register } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [showPw, setShowPw]     = useState(false);
    const [errors, setErrors]     = useState({});

    const validate = () => {
        const e = {};
        if (!username.trim())              e.username = 'Username is required.';
        else if (username.trim().length < 3) e.username = 'Username must be at least 3 characters.';
        if (!password)                     e.password = 'Password is required.';
        else if (password.length < 6)      e.password = 'Password must be at least 6 characters.';
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        try {
            register(username, password, currency);
        } catch (err) {
            setErrors({ username: err.message });
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo">✨</div>
                <h2>Create account</h2>
                <p className="auth-subtitle">Start tracking your daily notes</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label htmlFor="reg-user">Username</label>
                        <input
                            id="reg-user"
                            type="text"
                            placeholder="Choose a username (min 3 chars)"
                            value={username}
                            onChange={e => { setUsername(e.target.value); setErrors({}); }}
                            autoComplete="username"
                            className={errors.username ? 'input-error' : ''}
                        />
                        {errors.username && <span className="field-err">{errors.username}</span>}
                    </div>

                    <div className="auth-field">
                        <label htmlFor="reg-pw">Password</label>
                        <div className="pw-wrap">
                            <input
                                id="reg-pw"
                                type={showPw ? 'text' : 'password'}
                                placeholder="Create a password (min 6 chars)"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setErrors({}); }}
                                autoComplete="new-password"
                                className={errors.password ? 'input-error' : ''}
                            />
                            <button
                                type="button"
                                className="pw-toggle"
                                onClick={() => setShowPw(v => !v)}
                                aria-label="Toggle password visibility"
                            >
                                {showPw ? '🙈' : '👁'}
                            </button>
                        </div>
                        {errors.password && <span className="field-err">{errors.password}</span>}
                    </div>

                    <div className="auth-field">
                        <label htmlFor="reg-currency">Currency Preference</label>
                        <select
                            id="reg-currency"
                            value={currency}
                            onChange={e => setCurrency(e.target.value)}
                            className="currency-select"
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.symbol}  {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="auth-submit-btn">Create Account</button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <span onClick={onSwitch}>Sign in</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
