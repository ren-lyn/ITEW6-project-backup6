import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { STORAGE_URL } from './api/axios';
import ccsLogo from './assets/CCS LOGO.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

// Components
import StudentList from './components/Student/StudentList';
import FacultyList from './components/Faculty/FacultyList';
import EventList from './components/Event/EventList';
import ResearchList from './components/Research/ResearchList';
import MaterialList from './components/Material/MaterialList';
import ScheduleList from './components/Schedule/ScheduleList';

// Profiling Cycle Pages
import UserDashboard from './pages/Dashboard/UserDashboard';
import DocumentUpload from './pages/Document/DocumentUpload';
import VerificationList from './pages/Admin/VerificationList';
import AdminReports from './pages/Admin/AdminReports';
import AdminArchives from './pages/Admin/AdminArchives';
import StudentSchedule from './pages/Student/StudentSchedule';
import FacultyHandledCourses from './pages/Faculty/FacultyHandledCourses';



// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import UserProfile from './pages/Dashboard/UserProfile';
import Login from './pages/Auth/Login';
import ChangePassword from './pages/Auth/ChangePassword';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openMenus, setOpenMenus] = React.useState({ 'Attendance': true });
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    
    const toggleMenu = (name) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const userJson = localStorage.getItem('user');
    let user = null;
    try {
        if (userJson && userJson !== "undefined") {
            user = JSON.parse(userJson);
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user');
    }
    const role = user?.role || 'student';

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };


    let menuItems = [];
    if (role === 'admin') {
        menuItems = [
            { name: 'Admin Dashboard', path: '/admin', icon: 'bi-grid-1x2' },
            { name: 'Verification Approvals', path: '/admin/verifications', icon: 'bi-check2-square' },
            { name: 'Reports & Analytics', path: '/admin/reports', icon: 'bi-bar-chart-steps' },
            { name: 'Archived Profiles', path: '/admin/archives', icon: 'bi-folder' },
            { name: 'Students', path: '/admin/students', icon: 'bi-people' },
            { name: 'Faculty', path: '/admin/faculty', icon: 'bi-person-badge' },
            { name: 'Events', path: '/admin/events', icon: 'bi-calendar-date' },
            { name: 'Scheduling', path: '/admin/scheduling', icon: 'bi-clock-history' },
            { name: 'Research', path: '/admin/research', icon: 'bi-journal-code' },
            { name: 'Materials', path: '/admin/materials', icon: 'bi-file-earmark-pdf' },
        ];
    } else if (role === 'dean') {
        menuItems = [
            { name: 'Dean Dashboard', path: '/admin', icon: 'bi-grid-1x2' },
            { name: 'Scheduling', path: '/admin/scheduling', icon: 'bi-clock-history' },
        ];
    } else if (role === 'faculty') {
        menuItems = [
            { name: 'Faculty Dashboard', path: '/user', icon: 'bi-grid-1x2' },
            { name: 'My Profile', path: '/user/profile', icon: 'bi-person' },

            { name: 'My Syllabi/Research', path: '/user/research', icon: 'bi-journal-text' },
            { name: 'Handled Courses & Sections', path: '/user/handled-courses', icon: 'bi-journal-bookmark' },
        ];
    } else {
        menuItems = [
            { name: 'Student Dashboard', path: '/user', icon: 'bi-grid-1x2' },
            { name: 'My Profile', path: '/user/profile', icon: 'bi-person' },
            { name: 'My Schedule', path: '/user/schedule', icon: 'bi-calendar3' },
            { name: 'Events', path: '/user/events', icon: 'bi-calendar-event' },
        ];
    }

    return (
        <div className="d-flex flex-column min-vh-100 overflow-x-hidden">
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            <nav className="navbar navbar-dark fixed-top px-3 px-md-4 py-3 shadow-sm d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #F26A21 0%, #c14d0f 100%)', borderBottom: '3px solid #a33f08', zIndex: 1040 }}>
                <div className="d-flex align-items-center">
                    <button 
                        className="btn btn-link text-white d-md-none me-2 p-0 shadow-none" 
                        onClick={toggleSidebar}
                        aria-label="Toggle navigation"
                    >
                        <i className={`bi ${isSidebarOpen ? 'bi-x-lg' : 'bi-list'} fs-3`}></i>
                    </button>
                    <Link className="navbar-brand fw-bold d-flex align-items-center" style={{ color: '#ffffff' }} to="/">
                    <img src={ccsLogo} alt="CCS Logo" style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                    <span className="fs-5 tracking-tight ms-2" style={{ color: '#ffffff', fontWeight: '800' }}>CCS<span style={{ color: '#ffe6d5' }}> PROFILER</span></span>
                    </Link>
                </div>
                <div className="d-flex align-items-center">
                    <button className="btn btn-sm rounded-pill px-3 px-md-4 shadow-none fw-bold" onClick={handleLogout} style={{ border: '2px solid #ffffff', color: '#ffffff', backgroundColor: 'transparent' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#ffffff'; e.target.style.color = '#F26A21'; }} onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#ffffff'; }}>
                        Logout
                    </button>
                </div>
            </nav>
            <div className="container-fluid flex-grow-1" style={{ marginTop: '78px' }}>
                <div className="row flex-nowrap h-100">
                    <nav className={`d-none d-md-block sidebar py-4 shadow-sm ${isSidebarOpen ? 'show' : ''}`} style={{ zIndex: 1030, overflowY: 'auto' }}>
                        <div className="sidebar-sticky h-100 d-flex flex-column">
                            <div className="d-md-none px-4 mb-4 d-flex justify-content-between align-items-center">
                                <span className="text-white fw-bold fs-5">Menu</span>
                                <button className="btn btn-link text-white p-0" onClick={() => setIsSidebarOpen(false)}>
                                    <i className="bi bi-x-lg fs-4"></i>
                                </button>
                            </div>
                            {/* Top part of sidebar removed logo */}
                            <ul className="nav flex-column px-3 flex-grow-1 mt-2">
                                {menuItems.map((item, index) => {
                                    const delayClass = `delay-${Math.min((index + 1) * 100, 900)}`;
                                    const hasChildren = item.children && item.children.length > 0;
                                    const isOpen = openMenus[item.name];

                                    return (
                                        <li className={`nav-item mb-1 animate-nav-item ${delayClass}`} key={item.name}>
                                            {hasChildren ? (
                                                <>
                                                    <div 
                                                        className="nav-link py-2 px-3 d-flex align-items-center justify-content-between transition-all rounded text-white-50 small fw-bold text-uppercase ls-wider mb-1 cursor-pointer"
                                                        onClick={() => toggleMenu(item.name)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <i className={`bi ${item.icon} me-3`}></i>
                                                            {item.name}
                                                        </div>
                                                        <i className={`bi bi-chevron-${isOpen ? 'down' : 'right'} extra-small`}></i>
                                                    </div>
                                                    {isOpen && (
                                                        <ul className="nav flex-column ms-3 ps-2 border-start border-secondary border-opacity-25 mb-2">
                                                            {item.children.map(child => (
                                                                <li className="nav-item mb-1" key={child.path}>
                                                                    <Link
                                                                        className={`nav-link py-1 px-3 d-flex align-items-center transition-all rounded text-white ${location.pathname === child.path ? 'active' : 'opacity-75 hov-opacity-100'}`}
                                                                        to={child.path}
                                                                        style={{
                                                                            backgroundColor: location.pathname === child.path ? '#F26A21' : 'transparent',
                                                                            fontSize: '0.9rem'
                                                                        }}
                                                                    >
                                                                        {child.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </>
                                            ) : (
                                                <Link
                                                    className={`nav-link py-2 px-3 d-flex align-items-center transition-all rounded text-white ${location.pathname === item.path ? 'active' : ''}`}
                                                    to={item.path}
                                                    style={{
                                                        backgroundColor: location.pathname === item.path ? '#F26A21' : 'transparent',
                                                        color: location.pathname === item.path ? '#ffffff' : '#e0e0e0'
                                                    }}
                                                >
                                                    <i className={`bi ${item.icon} me-3 fs-5`}></i>
                                                    <span className="fw-medium">{item.name}</span>
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="mt-auto px-4 py-3 border-top border-secondary border-opacity-50 d-flex align-items-center">
                                {user?.profile_picture ? (
                                    <img 
                                        src={user.profile_picture.startsWith('http') ? user.profile_picture : `${STORAGE_URL}/${user.profile_picture}`} 
                                        alt="Profile" 
                                        className="rounded-circle me-3 object-fit-cover shadow-sm" 
                                        style={{ width: '40px', height: '40px', minWidth: '40px' }} 
                                    />
                                ) : (
                                    <div className="bg-success text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="overflow-hidden">
                                    <div className="fw-bold text-white text-truncate">{user?.name || 'Guest User'}</div>
                                    <div className="small text-capitalize" style={{ color: '#9ca3af' }}>{user?.role || 'Guest'}</div>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <main role="main" className="col-md-9 px-md-5 py-5 overflow-auto" style={{ backgroundColor: 'var(--ccs-bg-light)', minHeight: 'calc(100vh - 64px)' }}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = !!localStorage.getItem('access_token');
    const userJson = localStorage.getItem('user');
    let user = null;
    try {
        if (userJson && userJson !== "undefined") {
            user = JSON.parse(userJson);
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user');
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (user && user.must_change_password && window.location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        const target = ['admin', 'dean'].includes(user.role) ? '/admin' : '/user';
        return <Navigate to={target} replace />;
    }

    return children;
};

// Placeholder components to prevent errors until fully implemented
const DummyPage = ({ title }) => <div><h2>{title}</h2><p>This module is under construction.</p></div>;

function App() {
    const userJson = localStorage.getItem('user');
    let user = null;
    try {
        if (userJson && userJson !== "undefined") {
            user = JSON.parse(userJson);
        }
    } catch (e) {
        console.error("Failed to parse user", e);
    }
    const role = user?.role;

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

                {/* Root Redirection based on role */}
                <Route path="/" element={
                    <ProtectedRoute>
                        {['admin', 'dean'].includes(role) ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />}
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['admin', 'dean']}>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/verifications" element={<VerificationList />} />
                                <Route path="/reports" element={<AdminReports />} />
                                <Route path="/archives" element={<AdminArchives />} />
                                <Route path="/students" element={<StudentList />} />
                                <Route path="/faculty" element={<FacultyList />} />
                                <Route path="/events" element={<EventList />} />
                                <Route path="/scheduling" element={<ScheduleList />} />
                                <Route path="/research" element={<ResearchList />} />
                                <Route path="/materials" element={<MaterialList />} />
                                <Route path="*" element={<Navigate to="/admin" replace />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                } />

                {/* Student / Faculty Routes */}
                <Route path="/user/*" element={
                    <ProtectedRoute allowedRoles={['student', 'faculty']}>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<UserDashboard />} />
                                <Route path="/profile" element={<UserProfile />} />

                                <Route path="/schedule" element={<StudentSchedule />} />


                                <Route path="/events" element={<EventList />} />
                                <Route path="/handled-courses" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyHandledCourses /></ProtectedRoute>} />
                                <Route path="/research" element={<ResearchList />} />
                                <Route path="*" element={<Navigate to="/user" replace />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                } />

                {/* Catch-all global */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
