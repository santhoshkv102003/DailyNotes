import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Register = ({ onSwitch }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, password);
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-form-container" style={{
            maxWidth: '400px',
            margin: '100px auto',
            padding: '30px',
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>Register</h2>
            {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        required
                    />
                </div>
                <button type="submit" style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                }}>Register</button>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                Already have an account? <span onClick={onSwitch} style={{ color: '#667eea', cursor: 'pointer', fontWeight: 'bold' }}>Login</span>
            </p>
        </div>
    );
};

export default Register;
