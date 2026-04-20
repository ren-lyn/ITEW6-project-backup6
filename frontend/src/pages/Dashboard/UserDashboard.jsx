import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const [scoreData, setScoreData] = useState({ completion_score: 0, missing_fields: [] });
    const [facultySchedules, setFacultySchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Enrollment Modal State
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedYear, setSelectedYear] = useState('1');
    const [selectedSemester, setSelectedSemester] = useState('1st Semester');

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

    const curriculumData = {
        '1': {
            '1st Semester': [
                { code: 'CCS101', desc: 'Introduction to Computing', units: 3, prereq: 'None' },
                { code: 'CCS102', desc: 'Computer Programming 1', units: 3, prereq: 'None' },
                { code: 'MAT101', desc: 'Mathematics in the Modern World', units: 3, prereq: 'None' },
                { code: 'NSTP1', desc: 'National Service Training Program 1', units: 3, prereq: 'None' },
                { code: 'PED101', desc: 'Physical Activities Toward Health and Fitness 1', units: 2, prereq: 'None' },
                { code: 'PHD101', desc: 'PnCians Holistic Development 1', units: 1, prereq: 'None' },
                { code: 'PSY100', desc: 'Understanding the Self', units: 3, prereq: 'None' },
                { code: 'READ100', desc: 'Science and Development of Reading', units: 3, prereq: 'None' }
            ],
            '2nd Semester': [
                { code: 'CCS103', desc: 'Computer Programming 2', units: 3, prereq: 'CCS102' },
                { code: 'CCS114', desc: 'Web Technologies', units: 3, prereq: 'CCS101' },
                { code: 'COM101', desc: 'Purposive Communication', units: 3, prereq: 'None' },
                { code: 'GAD101', desc: 'Gender and Development', units: 3, prereq: 'None' },
                { code: 'HIS101', desc: 'Readings in Philippine History', units: 3, prereq: 'None' },
                { code: 'HMN101', desc: 'Art Appreciation', units: 3, prereq: 'None' },
                { code: 'NSTP2', desc: 'National Service Training Program 2', units: 3, prereq: 'NSTP1' },
                { code: 'PED102', desc: 'Physical Activities Toward Health and Fitness 2', units: 2, prereq: 'PED101' },
                { code: 'PHD102', desc: 'PnCians Holistic Development 2', units: 1, prereq: 'PHD101' }
            ]
        },
        '2': {
            '1st Semester': [
                { code: 'CCS105', desc: 'Human Computer Interaction 1', units: 3, prereq: 'CCS103' },
                { code: 'CCS107', desc: 'Data Structures and Algorithms', units: 3, prereq: 'CCS103' },
                { code: 'ENT101', desc: 'The Entrepreneurial Mind', units: 3, prereq: 'None' },
                { code: 'ETH101', desc: 'Ethics', units: 3, prereq: 'None' },
                { code: 'ITEW1', desc: 'Responsive Web Design', units: 3, prereq: 'CCS114' },
                { code: 'PED103', desc: 'Physical Activities Toward Health and Fitness 3', units: 2, prereq: 'PED102' },
                { code: 'RIZ101', desc: 'Life and Works of Rizal', units: 3, prereq: 'None' },
                { code: 'SOC101', desc: 'The Contemporary World', units: 3, prereq: 'None' },
                { code: 'STS101', desc: 'Science, Technology and Society', units: 3, prereq: 'None' }
            ],
            '2nd Semester': [
                { code: 'CCS104', desc: 'Discrete Structures', units: 3, prereq: 'CCS107' },
                { code: 'CCS106', desc: 'Social and Professional Issues', units: 3, prereq: 'ETH101' },
                { code: 'CCS108', desc: 'Object-Oriented Programming', units: 3, prereq: 'CCS107' },
                { code: 'CCS110', desc: 'Information Management 1', units: 3, prereq: 'CCS107' },
                { code: 'ITEW2', desc: 'Client/Server-Side Scripting', units: 3, prereq: 'ITEW1' },
                { code: 'ITP102', desc: 'Integrative Programming and Technologies', units: 3, prereq: 'None' },
                { code: 'ITP106', desc: 'Human Computer Interaction 2', units: 3, prereq: 'CCS105' },
                { code: 'PED104', desc: 'Physical Activities Toward Health and Fitness 4', units: 2, prereq: 'PED103' }
            ]
        },
        '3': {
            '1st Semester': [
                { code: 'CCS109', desc: 'System Analysis and Design', units: 3, prereq: 'CCS110' },
                { code: 'CCS111', desc: 'Networking and Communication 1', units: 3, prereq: '2nd Year Standing' },
                { code: 'ITEW3', desc: 'Mobile Programming 1', units: 3, prereq: 'ITEW2' },
                { code: 'ITP103', desc: 'System Integration and Architecture', units: 3, prereq: 'ITP102' },
                { code: 'ITP104', desc: 'Information Management System 2', units: 3, prereq: 'CCS110' },
                { code: 'ITP107', desc: 'Mobile Application Development', units: 3, prereq: '2nd Year Standing' }
            ],
            '2nd Semester': [
                { code: 'CCS112', desc: 'Applications Development and Emerging Technologies', units: 3, prereq: 'ITP103' },
                { code: 'CCS113', desc: 'Information Assurance and Security', units: 3, prereq: '3rd Year Standing' },
                { code: 'ENV101', desc: 'Environmental Science', units: 3, prereq: 'None' },
                { code: 'ITEW4', desc: 'Mobile Programming 2', units: 3, prereq: 'ITEW3' },
                { code: 'ITP108', desc: 'Capstone Project 1', units: 3, prereq: '3rd Year Standing' },
                { code: 'ITP109', desc: 'Platform Technologies', units: 3, prereq: 'ITP103' },
                { code: 'TEC101', desc: 'Technopreneurship', units: 3, prereq: 'ENT101' }
            ],
            'Summer': [
                { code: 'ITP101', desc: 'Quantitative Methods', units: 3, prereq: 'CCS104' },
                { code: 'ITP105', desc: 'Networking and Communication 2', units: 3, prereq: 'CCS111' }
            ]
        },
        '4': {
            '1st Semester': [
                { code: 'ITP111', desc: 'System Administration and Maintenance', units: 3, prereq: 'ITP109, ITP105' },
                { code: 'ITP112', desc: 'Capstone Project 2', units: 3, prereq: 'ITP108' }
            ],
            '2nd Semester': [
                { code: 'ITP113', desc: 'IT Practicum (500 hours)', units: 9, prereq: '4th Year Standing' }
            ]
        }
    };

    const currentYearData = curriculumData[selectedYear] || {};
    const curriculumTrackerData = currentYearData[selectedSemester] || [];
    const totalUnits = curriculumTrackerData.reduce((acc, curr) => acc + curr.units, 0);

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

                {/* Enrollment Banner */}
                <div className="card border-0 rounded-4 mb-4" style={{ backgroundColor: '#fff5f3', border: '1px solid #ffebea' }}>
                    <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '45px', height: '45px', flexShrink: 0 }}>
                                <i className="bi bi-exclamation-lg fs-4"></i>
                            </div>
                            <div>
                                <h5 className="fw-bold text-dark mb-1">Ready to Enroll?</h5>
                                <p className="text-muted small mb-0">Submit your enrollment for A.Y. 2026-2027 today.</p>
                            </div>
                        </div>
                        <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold shadow-sm" onClick={() => setShowEnrollmentModal(true)}>
                            Start Enrollment <i className="bi bi-arrow-right ms-1"></i>
                        </button>
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

                {/* Enrollment Modal */}
                {showEnrollmentModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 rounded-4 shadow">
                                <div className="modal-header border-0 pb-0">
                                    <h4 className="modal-title fw-bold text-danger">Enrollment Application</h4>
                                    <button type="button" className="btn-close" onClick={() => setShowEnrollmentModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-dark">Select Degree Program</label>
                                            <select className="form-select bg-light border-0" value={selectedProgram} onChange={e => { setSelectedProgram(e.target.value); setSelectedSection(''); }}>
                                                <option value="">Select Academic Program</option>
                                                <option value="BS in Information Technology">BS in Information Technology</option>
                                                <option value="BS in Computer Science">BS in Computer Science</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small text-dark">Year Level</label>
                                            <select className="form-select bg-light border-0" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small text-dark">Semester</label>
                                            <select className="form-select bg-light border-0" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                                                <option value="1st Semester">1st Semester</option>
                                                <option value="2nd Semester">2nd Semester</option>
                                                {selectedYear === '3' && <option value="Summer">Summer</option>}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark">Block Section Scheduling</h6>
                                        <p className="small text-muted mb-3">Select a block section to preview the subjects, schedule, and professors you will be enrolled under.</p>
                                        <select className="form-select bg-light border-0" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedProgram}>
                                            <option value="">{selectedProgram ? 'Select Section' : 'Please select a Program first'}</option>
                                            {selectedProgram === 'BS in Information Technology' && (
                                                <>
                                                    <option value="IT1A">IT1A</option>
                                                    <option value="IT1B">IT1B</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    {selectedSection && (
                                        <div className="border rounded-4 overflow-hidden mb-4 animate-slide-up">
                                            <div className="bg-danger bg-opacity-10 text-danger fw-bold p-3">
                                                Academic Tracker: {selectedYear}{selectedYear === '1' ? 'st' : selectedYear === '2' ? 'nd' : selectedYear === '3' ? 'rd' : 'th'} Year - {selectedSemester}
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead className="bg-light">
                                                        <tr className="small text-muted">
                                                            <th className="ps-4">COURSE CODE</th>
                                                            <th>COURSE DESCRIPTION</th>
                                                            <th className="text-center">UNITS</th>
                                                            <th>PREREQUISITE</th>
                                                            <th>STATUS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {curriculumTrackerData.map((cl, i) => (
                                                            <tr key={i}>
                                                                <td className="ps-4 fw-bold">{cl.code}</td>
                                                                <td className="small fw-medium">{cl.desc}</td>
                                                                <td className="text-center fw-bold">{cl.units}</td>
                                                                <td className="small text-muted">{cl.prereq}</td>
                                                                <td><span className="badge bg-success bg-opacity-10 text-success rounded-pill">Open</span></td>
                                                            </tr>
                                                        ))}
                                                        <tr className="bg-light">
                                                            <td colSpan="2" className="text-end fw-bold small text-muted pe-4 pb-0 pt-3">Total No. of Units</td>
                                                            <td className="text-center fw-bold fs-6 text-dark pb-0 pt-3">{totalUnits}</td>
                                                            <td colSpan="2"></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    <div className="alert alert-danger bg-danger bg-opacity-10 border-0 rounded-4 small mb-0">
                                        By clicking <strong>Complete Enrollment</strong>, you confirm that you wish to enroll in the selected program and section for Academic Year 2026-2027.
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0 pe-4 pb-4">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold shadow-none" onClick={() => setShowEnrollmentModal(false)}>Cancel</button>
                                    <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold shadow-none" onClick={() => { 
                                        alert('Enrollment Application Completed!'); 
                                        setShowEnrollmentModal(false); 
                                    }}>Complete Enrollment</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                                    ? 'Your profile is complete! Check your documents.'
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

                <div className="col-md-4">
                    <Link to="/user/documents" className="text-decoration-none transition-all">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white d-flex flex-row align-items-center card-stats">
                            <div className="bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-4" style={{ width: '56px', height: '56px' }}>
                                <i className="bi bi-file-earmark-text fs-4"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold text-dark mb-1">Documents</h6>
                                <p className="small text-muted mb-0">Upload requirements</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="col-md-4">
                    <Link to="/user/attendance/import" className="text-decoration-none transition-all">
                        <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white d-flex flex-row align-items-center card-stats">
                            <div className="bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-4" style={{ width: '56px', height: '56px' }}>
                                <i className="bi bi-calendar-check fs-4"></i>
                            </div>
                            <div className="pt-2">
                                <h6 className="fw-bold text-dark mb-1">Import Attendance</h6>
                                <p className="small text-muted mb-0">Upload student records via CSV</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="mt-5">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
                    <i className="bi bi-journal-bookmark text-primary me-2"></i>
                    Handled Courses & Sections
                </h5>
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
