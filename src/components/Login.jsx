import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSwitch }) => {
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [errors, setErrors]     = useState({});
    const [globalErr, setGlobalErr] = useState('');

    const validate = () => {
        const e = {};
        if (!username.trim()) e.username = 'Username is required.';
        if (!password)        e.password = 'Password is required.';
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setGlobalErr('');
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setErrors({});
        try {
            login(username, password);
        } catch (err) {
            setGlobalErr(err.message);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo">🔐</div>
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Sign in to Daily Notes</p>

                {globalErr && <div className="auth-error">{globalErr}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label htmlFor="login-user">Username</label>
                        <input
                            id="login-user"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => { setUsername(e.target.value); setErrors({}); }}
                            autoComplete="username"
                            className={errors.username ? 'input-error' : ''}
                        />
                        {errors.username && <span className="field-err">{errors.username}</span>}
                    </div>

                    <div className="auth-field">
                        <label htmlFor="login-pw">Password</label>
                        <div className="pw-wrap">
                            <input
                                id="login-pw"
                                type={showPw ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setErrors({}); }}
                                autoComplete="current-password"
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

                    <button type="submit" className="auth-submit-btn">Login</button>
                </form>

                <p className="auth-switch">
                    No account?{' '}
                    <span onClick={onSwitch}>Create one</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
