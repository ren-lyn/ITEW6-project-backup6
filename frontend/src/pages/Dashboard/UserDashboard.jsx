import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const [scoreData, setScoreData] = useState({ completion_score: 0, missing_fields: [] });
    const [facultySchedules, setFacultySchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;



    useEffect(() => {
        const fetchData = async () => {
            try {
                const scoreRes = await api.get('/profile/completion');
                setScoreData(scoreRes.data);

                if (user?.role === 'faculty') {
                    const scheduleRes = await api.get('/faculty/schedules');
                    setFacultySchedules(scheduleRes.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    const { completion_score } = scoreData;






    if (user?.role === 'student') {
        return (
            <div>
                {/* Welcome Banner */}
                <div className="card border-0 rounded-4 mb-4" style={{ backgroundColor: '#edf7f3', border: '1px solid #d1e9de' }}>
                    <div className="card-body p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill mb-2 px-3 py-1 fw-bold" style={{ fontSize: '0.7rem' }}>
                                <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i> ACTIVE
                            </span>
                            <h3 className="fw-bold text-dark mb-1">
                                Welcome back, <span className="text-danger">{user?.name?.split(' ')[0] || 'Student'}!</span>
                            </h3>
                            <p className="text-muted small mb-0">Access your academic records and departmental activities.</p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="text-end d-none d-sm-block">
                                <div className="fw-bold text-muted" style={{ fontSize: '0.7rem' }}>AY 2026-2027</div>
                                <div className="fw-bold text-dark small">First Semester</div>
                            </div>
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '45px', height: '45px' }}>
                                <i className="bi bi-clock-history text-danger fs-5"></i>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Announcements & Events */}
                <div className="row g-4 mb-4">
                    <div className="col-md-7">
                        <div className="card border-0 rounded-4 h-100" style={{ backgroundColor: '#f9fbf9', border: '1px solid #eef2ef' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-dark mb-4"><i className="bi bi-megaphone me-2 text-danger"></i> Recent Announcements</h6>
                                
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-1">Midterm Examinations</h6>
                                    <p className="small text-muted mb-2">Examination schedule for midterm has been released. Please check your portals.</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>BY REGISTRAR</span>
                                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>4/15/2026</span>
                                    </div>
                                    <hr className="text-muted opacity-25 my-3" />
                                </div>

                                <div>
                                    <h6 className="fw-bold mb-1">CCS Week 2026</h6>
                                    <p className="small text-muted mb-2">Join us for a week of tech talks, competitions, and networking events!</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>BY CCS STUDENT COUNCIL</span>
                                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>4/20/2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-5">
                        <div className="card border-0 rounded-4 h-100" style={{ backgroundColor: '#f9fbf9', border: '1px solid #eef2ef' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-dark mb-4"><i className="bi bi-calendar-event me-2 text-primary"></i> Upcoming Events</h6>
                                
                                <div className="d-flex gap-3 mb-4">
                                    <div className="bg-white rounded-3 shadow-sm border d-flex flex-column align-items-center justify-content-center text-primary fw-bold" style={{ width: '55px', height: '55px', flexShrink: 0 }}>
                                        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Apr</span>
                                        <span className="fs-5 lh-1">25</span>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Hackathon 2026</h6>
                                        <div className="small text-muted d-flex align-items-center gap-2">
                                            <span><i className="bi bi-geo-alt me-1 text-danger"></i> CCS Lab 1</span>
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: '0.6rem' }}>COMPETITION</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-3">
                                    <div className="bg-white rounded-3 shadow-sm border d-flex flex-column align-items-center justify-content-center text-primary fw-bold" style={{ width: '55px', height: '55px', flexShrink: 0 }}>
                                        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>May</span>
                                        <span className="fs-5 lh-1">2</span>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1">IT Seminar</h6>
                                        <div className="small text-muted d-flex align-items-center gap-2">
                                            <span><i className="bi bi-geo-alt me-1 text-danger"></i> University Hall</span>
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: '0.6rem' }}>SEMINAR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        );
    }

    // Faculty Dashboard Logic Preserved
    return (
        <div>
            <div className="row g-4 mb-4 align-items-stretch">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column justify-content-between">
                        <div className="d-flex align-items-center mb-4">
                            <div className="text-white fw-bold rounded-4 d-flex align-items-center justify-content-center me-4 fs-1"
                                style={{ width: '90px', height: '90px', backgroundColor: 'var(--ccs-primary-blue)', boxShadow: '0 4px 15px rgba(59,58,238,0.3)' }}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h4 className="fw-bold mb-1 fs-5 text-dark">{user?.name}</h4>
                                <div className="text-muted small mb-2">{user?.email}</div>
                                <div className="d-flex gap-2">
                                    <span className="badge text-warning bg-warning bg-opacity-10 rounded-pill px-3 py-1">Pending</span>
                                    <span className="badge text-muted bg-light border rounded-pill px-3 py-1 text-capitalize fw-normal">{user?.role}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small fw-medium">Profile Completion</span>
                                <span className="text-muted small">{completion_score}%</span>
                            </div>
                            <div className="progress rounded-pill bg-light" style={{ height: '10px' }}>
                                <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${completion_score}%`, backgroundColor: 'var(--ccs-accent-orange)' }}></div>
                            </div>
                            <div className="small text-muted mt-2 opacity-75">
                                {completion_score === 100
                                    ? 'Your profile is complete!'
                                    : 'Complete your profile to get approved faster!'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 p-4 h-100 d-flex flex-column justify-content-center text-white"
                        style={{ backgroundColor: 'var(--ccs-primary-blue)', backgroundImage: 'linear-gradient(135deg, var(--ccs-primary-blue) 0%, var(--ccs-primary-blue-hover) 100%)', boxShadow: '0 10px 25px rgba(59,58,238,0.2)' }}>
                        <div className="mb-3">
                            <i className="bi bi-shield-check fs-2 text-white opacity-75"></i>
                        </div>
                        <h5 className="fw-bold mb-2">Profile Status</h5>
                        <p className="small mb-4 text-white text-opacity-75" style={{ lineHeight: '1.5' }}>
                            Your profile is currently pending. Please wait for admin approval.
                        </p>
                        <Link to="/user/profile" className="btn btn-light bg-white bg-opacity-25 border-0 text-white fw-bold rounded-3 py-2 w-100" style={{ backdropFilter: 'blur(5px)' }}>
                            Update Profile
                        </Link>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-4">
                    <Link to="/user/profile" className="text-decoration-none transition-all">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white d-flex flex-row align-items-center card-stats">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-4" style={{ width: '56px', height: '56px' }}>
                                <i className="bi bi-person fs-4"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold text-dark mb-1">My Profile</h6>
                                <p className="small text-muted mb-0">Manage information</p>
                            </div>
                        </div>
                    </Link>
                </div>




            </div>

            <div className="mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
                        <i className="bi bi-journal-bookmark text-primary me-2"></i>
                        Handled Courses & Sections
                    </h5>
                    <Link to="/user/handled-courses" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">
                        View All <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                </div>
                {facultySchedules.length === 0 ? (
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                        <i className="bi bi-calendar-x text-muted fs-1 mb-3"></i>
                        <p className="text-muted mb-0">No assigned courses or sections found.</p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {facultySchedules.map((sched) => (
                            <div key={sched.schedule_id} className="col-md-4">
                                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-primary">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                                            {sched.section}
                                        </span>
                                        <span className="small text-muted">{sched.subject_code}</span>
                                    </div>
                                    <h6 className="fw-bold text-dark mb-1">{sched.title || sched.subject}</h6>
                                    <div className="d-flex align-items-center mt-3 text-muted extra-small">
                                        <i className="bi bi-clock me-1"></i>
                                        {sched.days_of_week} | {sched.start_time} - {sched.end_time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
