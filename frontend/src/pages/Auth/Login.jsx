import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import ccsLogo from '../../assets/CCS LOGO.jpg';
import ccsBg from '../../assets/ccs-bg.png';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/login', credentials);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // We are replacing animejs with CSS animations directly since Animejs v4 caused a bug with ref iterations in React.

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{ background: '#000' }}>
            {/* Background Image with Layered Blurs */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ 
                backgroundImage: `url(${ccsBg})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                opacity: 0.6
            }}></div>
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ 
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(243, 112, 33, 0.1) 50%, rgba(0,0,0,0.8) 100%)',
                backdropFilter: 'blur(5px)'
            }}></div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate-slide-up position-relative" style={{ maxWidth: '900px', width: '100%', opacity: 0, backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="row g-0">
                    <div className="col-md-6 p-5 d-flex flex-column justify-content-center align-items-center text-white text-center" style={{ background: 'linear-gradient(135deg, rgba(243, 112, 33, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)' }}>
                        <div className="animate-slide-right delay-300 mb-4">
                            <img
                                src={ccsLogo}
                                alt="CCS Logo"
                                className="bg-white rounded-circle shadow"
                                style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }}
                            />
                        </div>
                        <h2 className="display-5 fw-bold mb-2 animate-slide-right delay-400">CCS PROFILER</h2>
                        <div className="w-25 border-bottom border-white opacity-25 mt-3 animate-slide-right delay-500"></div>
                    </div>
                    <div className="col-md-6 p-5 bg-white">
                        <div className="text-center mb-5 animate-slide-up delay-500">
                            <h3 className="fw-bold">Welcome Back</h3>
                            <p className="text-secondary">Please sign in to your corporate account</p>
                        </div>

                        {error && <div className="alert alert-danger border-0 small rounded-3 mb-4 animate-slide-up">{error}</div>}

                        <form onSubmit={handleLogin}>
                            <div className="mb-4 animate-slide-up delay-600">
                                <label className="form-label small fw-bold text-secondary text-uppercase">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control form-control-lg border-0 bg-light rounded-3 px-3 shadow-none focus-ring focus-ring-warning"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-5 animate-slide-up delay-700">
                                <label className="form-label small fw-bold text-secondary text-uppercase">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control form-control-lg border-0 bg-light rounded-3 px-3 shadow-none focus-ring focus-ring-warning"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="animate-slide-up delay-800">
                                <button
                                    type="submit"
                                    className="btn btn-lg w-100 rounded-pill py-3 fw-bold shadow-sm"
                                    disabled={loading}
                                    style={{ backgroundColor: '#F26A21', color: '#ffffff', border: 'none' }}
                                    onMouseOver={(e) => { e.target.style.backgroundColor = '#d95a1a'; }}
                                    onMouseOut={(e) => { e.target.style.backgroundColor = '#F26A21'; }}
                                >
                                    {loading ? 'Logging in...' : 'Sign In'}
                                </button>
                            </div>
                            
                            {/* Demo Accounts Section */}
                            <div className="mt-5 pt-4 border-top animate-slide-up delay-900">
                                <p className="small fw-bold text-secondary text-uppercase mb-3">Demo Accounts (Click to auto-fill)</p>
                                <div className="row g-2">
                                    {[
                                        { label: 'Admin', email: 'admin@ccs.edu' },
                                        { label: 'Dean', email: 'dean@ccs.edu' },
                                        { label: 'Faculty', email: 'turing@faculty.edu' },
                                        { label: 'Student', email: 'john@student.edu' }
                                    ].map((acc) => (
                                        <div key={acc.label} className="col-6">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm w-100 text-start px-3 py-2 border-0 bg-light"
                                                onClick={() => setCredentials({ email: acc.email, password: 'password' })}
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                <div className="fw-bold text-dark">{acc.label}</div>
                                                <div className="text-muted text-truncate">{acc.email}</div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center mt-3">
                                    <span className="badge bg-light text-dark fw-normal border">Password: <span className="fw-bold">password</span></span>
                                </div>
                            </div>

                            <div className="text-center mt-4 animate-slide-up delay-900">
                                <p className="small text-muted mb-0">Forgot your password? <a href="#" style={{ color: '#F26A21' }} className="text-decoration-none fw-bold">Contact IT Support</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );


};

export default Login;
