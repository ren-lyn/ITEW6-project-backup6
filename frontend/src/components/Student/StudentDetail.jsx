import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const StudentDetail = ({ studentId, onBack }) => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showVioForm, setShowVioForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editModeAcademic, setEditModeAcademic] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [editData, setEditData] = useState({});
    
    // Document review states
    const [actionLoadingDoc, setActionLoadingDoc] = useState(null);
    const [rejectDocData, setRejectDocData] = useState(null);
    const [rejectRemarks, setRejectRemarks] = useState('');

    // Helper to format proper image url
    const getProfileImageUrl = () => {
        const profile_picture = student.user?.profile_picture;
        if (!profile_picture) return null;
        if (profile_picture.startsWith('http')) return profile_picture;
        return `${api.defaults.baseURL.replace('/api', '')}/storage/${profile_picture}`;
    };

    
    const [newVio, setNewVio] = useState({
        violation_type: '',
        severity_level: 'Minor',
        date_of_violation: new Date().toISOString().split('T')[0],
        sanction_given: '',
        case_status: 'Ongoing',
        behavioral_remarks: ''
    });

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await api.put(`/students/${studentId}`, editData);
            setEditMode(false);
            setEditModeAcademic(false);
            fetchStudent();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile changes.');
        } finally {
            setSavingProfile(false);
        }
    };

    const fetchStudent = async () => {
        try {
            const response = await api.get(`/students/${studentId}`);
            setStudent(response.data);
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [studentId]);

    const handleAddViolation = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/students/${studentId}/violations`, newVio);
            setShowVioForm(false);
            setNewVio({
                violation_type: '',
                severity_level: 'Minor',
                date_of_violation: new Date().toISOString().split('T')[0],
                sanction_given: '',
                case_status: 'Ongoing',
                behavioral_remarks: ''
            });
            fetchStudent();
        } catch (error) {
            console.error('Error adding violation:', error);
            alert('Failed to record violation.');
        }
    };

    const handleArchive = async () => {
        const userId = student.user_id || student.user?.id;
        if (!userId) {
            alert('User ID missing. Cannot archive.');
            return;
        }
        if (!window.confirm('Are you sure you want to archive this user profile?')) return;

        try {
            await api.post(`/admin/users/${userId}/archive`);
            alert('User archived successfully');
            onBack(); // Return to directory
        } catch (error) {
            console.error('Error archiving user:', error);
            alert(error.response?.data?.message || 'Error archiving user.');
        }
    };

    const handleApproveDoc = async (id) => {
        if (!window.confirm('Are you sure you want to approve this document submission?')) return;
        setActionLoadingDoc(id);
        try {
            await api.post(`/admin/verifications/doc_${id}/approve`);
            fetchStudent(); // Refresh data
        } catch (error) {
            console.error('Error approving document:', error);
            alert('Failed to approve document.');
        } finally {
            setActionLoadingDoc(null);
        }
    };

    const handleRejectDoc = async (e) => {
        e.preventDefault();
        if (!rejectRemarks.trim()) return;
        
        setActionLoadingDoc(rejectDocData.id);
        try {
            await api.post(`/admin/verifications/doc_${rejectDocData.id}/reject`, { remarks: rejectRemarks });
            setRejectDocData(null);
            setRejectRemarks('');
            fetchStudent();
        } catch (error) {
            console.error('Error rejecting document:', error);
            alert('Failed to reject document.');
        } finally {
            setActionLoadingDoc(null);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (!student) return <div className="alert alert-danger">Student not found.</div>;

    const riskLevel = student.risk_indicators_json?.length > 0 ? 'High' : (student.semester_gpa < 2.0 ? 'Medium' : 'Low');

    return (
        <div className="container-fluid p-0 animate-slide-up">
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary rounded-pill me-3 border-0 shadow-sm bg-white" onClick={onBack}>
                    <i className="bi bi-arrow-left"></i> Back to Directory
                </button>
                <div className="flex-grow-1">
                    <h2 className="display-6 fw-bold mb-0 text-dark">Student Comprehensive Profile</h2>
                    <p className="small text-muted mb-0 font-monospace text-uppercase tracking-wider">Profiling ID: {student.id_number || student.student_id}</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Sidebar: Profile Summary */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="p-5 text-center position-relative" style={{ background: 'linear-gradient(135deg, #f37021 0%, #212121 100%)' }}>
                            <div className="bg-white rounded-circle shadow p-1 d-inline-block mx-auto position-relative" style={{ width: '150px', height: '150px' }}>
                                <div className="w-100 h-100 rounded-circle bg-light d-flex align-items-center justify-content-center overflow-hidden position-relative group">
                                     {getProfileImageUrl() ? (
                                         <img src={getProfileImageUrl()} alt="Profile" className="w-100 h-100 object-fit-cover shadow-sm" />
                                     ) : (
                                         <i className="bi bi-person-fill display-1 text-secondary opacity-25"></i>
                                     )}
                                </div>
                            </div>
                        </div>
                        <div className="card-body text-center pt-3">
                            <div className="bg-white rounded-4 p-3 shadow-sm mx-auto mb-4 border" style={{ maxWidth: '350px' }}>
                                <h4 className="fw-bold mb-1 text-dark text-truncate px-2">{student.first_name} {student.last_name}</h4>
                                <div className="badge bg-primary bg-opacity-25 text-dark border border-primary border-opacity-10 rounded-pill px-3 py-1">
                                    {student.academic_records?.[0]?.course || 'No Course'}
                                </div>
                            </div>

                            <div className="text-start px-2">
                                <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2">Primary Info</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="p-3 bg-light rounded-4 h-100 border border-white">
                                            <div className="small text-muted mb-1">Year Level</div>
                                            <h5 className="fw-bold mb-0">{student.academic_records?.[0]?.year_level || 'N/A'}</h5>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 bg-light rounded-4 h-100 border border-white">
                                            <div className="small text-muted mb-1">Current GWA</div>
                                            <h5 className="fw-bold mb-0 text-primary">{student.academic_records?.[0]?.gwa || 'N/A'}</h5>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2">Contact Details</h6>
                                <ul className="list-unstyled small mb-4">
                                    <li className="mb-2"><i className="bi bi-envelope text-primary me-2"></i> {student.email || student.user?.email}</li>
                                    <li className="mb-2"><i className="bi bi-telephone text-primary me-2"></i> {student.contact_number || 'N/A'}</li>
                                    <li className="mb-2"><i className="bi bi-geo-alt text-primary me-2"></i> {student.present_address || 'N/A'}</li>
                                </ul>

                                <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2">Risk Rating</h6>
                                <div className={`p-3 rounded-4 mb-4 border-start border-4 ${student.violations?.length > 0 ? 'bg-danger bg-opacity-10 border-danger text-danger' : 'bg-success bg-opacity-10 border-success text-success'}`}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold small">{student.violations?.length > 0 ? 'Behavioral Review Required' : 'Excellent Performance'}</span>
                                        <i className={`bi ${student.violations?.length > 0 ? 'bi-shield-exclamation' : 'bi-shield-check'}`}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content: Comprehensive Data */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <div className="card-header bg-white border-0 pt-3">
                            <ul className="nav nav-tabs nav-fill border-0 px-2" style={{ gap: '10px' }}>
                                {[
                                    { id: 'personal', label: '1. Personal', icon: 'bi-person' },
                                    { id: 'academic', label: '2. Academic', icon: 'bi-book' },
                                    { id: 'non-academic', label: '3. Non-Academic', icon: 'bi-trophy' },
                                    { id: 'violations', label: '4. Violations', icon: 'bi-exclamation-octagon' },
                                    { id: 'skills', label: '5. Skills', icon: 'bi-lightning' },
                                    { id: 'affiliations', label: '6. Affiliations', icon: 'bi-people' },
                                    { id: 'physical', label: '7. Physical', icon: 'bi-body-text' },
                                    { id: 'medical', label: '8. Medical', icon: 'bi-heart-pulse' },
                                    { id: 'behavioral', label: '9. Behavioral', icon: 'bi-chat-dots' },
                                    { id: 'documents', label: '10. Documents', icon: 'bi-file-earmark-check' }
                                ].map(tab => (
                                    <li className="nav-item" key={tab.id}>
                                        <button
                                            className={`nav-link rounded-pill py-2 border-0 small px-3 transition-all ${activeTab === tab.id ? 'active shadow-sm fw-bold' : ''}`}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={activeTab === tab.id ? { backgroundColor: '#f37021', color: '#ffffff' } : { backgroundColor: '#f0f2f5', color: '#4a5568' }}
                                        >
                                            <i className={`bi ${tab.icon} me-1`}></i> {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card-body p-4">
                            {activeTab === 'personal' && (
                                <div className="fade-in">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0 text-dark">
                                            <i className="bi bi-person-fill text-primary me-2"></i> Personal Information
                                        </h5>
                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn btn-sm btn-outline-warning rounded-pill px-4 fw-bold shadow-sm"
                                                style={{ borderColor: '#f37021', color: '#f37021' }}
                                                onClick={handleArchive}
                                            >
                                                <i className="bi bi-archive me-2"></i> Archive Profile
                                            </button>
                                            <button 
                                                className={`btn btn-sm ${editMode ? 'btn-secondary' : 'btn-outline-primary'} rounded-pill px-4 fw-bold shadow-sm`}
                                                onClick={() => {
                                                    if (editMode) {
                                                        setEditMode(false);
                                                    } else {
                                                        setEditData({
                                                            nickname: student.nickname || '',
                                                            gender: student.gender || '',
                                                            nationality: student.nationality || 'Filipino',
                                                            civil_status: student.civil_status || 'Single',
                                                            religion: student.religion || '',
                                                            father_name: student.guardians?.father_name || '',
                                                            mother_name: student.guardians?.mother_name || '',
                                                            guardian_contact: student.guardians?.guardian_contact || ''
                                                        });
                                                        setEditMode(true);
                                                    }
                                                }}
                                            >
                                                {editMode ? 'Cancel Edit' : 'Edit Profile'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {editMode ? (
                                        <form onSubmit={handleSaveProfile}>
                                            <div className="row g-4 mb-4">
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted text-uppercase fw-bold mb-1">Nickname</label>
                                                    <input type="text" name="nickname" className="form-control rounded-3 py-2" value={editData.nickname} onChange={handleEditChange} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted text-uppercase fw-bold mb-1">Gender</label>
                                                    <select name="gender" className="form-select rounded-3 py-2" value={editData.gender} onChange={handleEditChange}>
                                                        <option value="">Select Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted text-uppercase fw-bold mb-1">Nationality</label>
                                                    <input type="text" name="nationality" className="form-control rounded-3 py-2" value={editData.nationality} onChange={handleEditChange} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted text-uppercase fw-bold mb-1">Civil Status</label>
                                                    <select name="civil_status" className="form-select rounded-3 py-2" value={editData.civil_status} onChange={handleEditChange}>
                                                        <option value="Single">Single</option>
                                                        <option value="Married">Married</option>
                                                        <option value="Widowed">Widowed</option>
                                                        <option value="Divorced">Divorced</option>
                                                    </select>
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label small text-muted text-uppercase fw-bold mb-1">Religion</label>
                                                    <input type="text" name="religion" className="form-control rounded-3 py-2" value={editData.religion} onChange={handleEditChange} />
                                                </div>
                                            </div>

                                            <h6 className="fw-bold mb-3 mt-5 text-muted small text-uppercase tracking-widest">Family & Guardian Info</h6>
                                            <div className="p-4 rounded-4 bg-light bg-opacity-50 border mb-4">
                                                <div className="row g-4">
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted mb-1">Father's Name</label>
                                                        <input type="text" name="father_name" className="form-control rounded-3 py-2" value={editData.father_name} onChange={handleEditChange} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted mb-1">Mother's Name</label>
                                                        <input type="text" name="mother_name" className="form-control rounded-3 py-2" value={editData.mother_name} onChange={handleEditChange} />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label small text-muted mb-1">Guardian Contact</label>
                                                        <input type="text" name="guardian_contact" className="form-control rounded-3 py-2" value={editData.guardian_contact} onChange={handleEditChange} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-end">
                                                <button type="submit" className="btn btn-primary px-5 py-2 fw-bold" disabled={savingProfile}>
                                                    {savingProfile ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="row g-4 mb-4">
                                                <div className="col-md-6"><label className="small text-muted d-block text-uppercase fw-bold mb-1">Nickname</label><span className="fw-bold">{student.nickname || 'N/A'}</span></div>
                                                <div className="col-md-6"><label className="small text-muted d-block text-uppercase fw-bold mb-1">Gender</label><span className="fw-bold">{student.gender || 'N/A'}</span></div>
                                                <div className="col-md-6"><label className="small text-muted d-block text-uppercase fw-bold mb-1">Nationality</label><span className="fw-bold">{student.nationality || 'Filipino'}</span></div>
                                                <div className="col-md-6"><label className="small text-muted d-block text-uppercase fw-bold mb-1">Civil Status</label><span className="fw-bold">{student.civil_status || 'Single'}</span></div>
                                                <div className="col-12"><label className="small text-muted d-block text-uppercase fw-bold mb-1">Religion</label><span className="fw-bold">{student.religion || 'N/A'}</span></div>
                                            </div>

                                            <h6 className="fw-bold mb-3 mt-5 text-muted small text-uppercase tracking-widest">Family & Guardian Info</h6>
                                            <div className="p-4 rounded-4 bg-light bg-opacity-50 border">
                                                <div className="row g-4">
                                                    <div className="col-md-6"><label className="small text-muted d-block mb-1">Father's Name</label><div className="fw-bold">{student.guardians?.father_name || 'N/A'}</div></div>
                                                    <div className="col-md-6"><label className="small text-muted d-block mb-1">Mother's Name</label><div className="fw-bold">{student.guardians?.mother_name || 'N/A'}</div></div>
                                                    <div className="col-12"><label className="small text-muted d-block mb-1">Guardian Contact</label><div className="fw-bold">{student.guardians?.guardian_contact || 'N/A'}</div></div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'academic' && (
                                <div className="fade-in">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0 text-dark">
                                            <i className="bi bi-book-fill text-primary me-2"></i> Academic History & Records
                                        </h5>
                                        <button 
                                            className={`btn btn-sm ${editModeAcademic ? 'btn-secondary' : 'btn-outline-primary'} rounded-pill px-4 fw-bold shadow-sm`}
                                            onClick={() => {
                                                if (editModeAcademic) {
                                                    setEditModeAcademic(false);
                                                } else {
                                                    const currentRec = student.academic_records?.[0] || {};
                                                    setEditData({
                                                        course: currentRec.course || 'BSIT',
                                                        year_level: currentRec.year_level || '1',
                                                        overall_gwa: currentRec.gwa || '',
                                                        academic_standing: currentRec.academic_standing || 'Regular'
                                                    });
                                                    setEditModeAcademic(true);
                                                }
                                            }}
                                        >
                                            {editModeAcademic ? 'Cancel Edit' : 'Update Current Record'}
                                        </button>
                                    </div>
                                    
                                    {editModeAcademic && (
                                        <form onSubmit={handleSaveProfile} className="mb-4 fade-in">
                                            <div className="p-4 rounded-4 bg-light shadow-sm border">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-primary tracking-widest"><i className="bi bi-pencil-square me-2"></i>Edit Current Semester Record</h6>
                                                <div className="row g-4 mb-4">
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted text-uppercase fw-bold mb-1">Course/Program</label>
                                                        <input type="text" name="course" className="form-control rounded-3 py-2 border-primary border-opacity-25" value={editData.course} onChange={handleEditChange} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted text-uppercase fw-bold mb-1">Year Level</label>
                                                        <input type="number" name="year_level" className="form-control rounded-3 py-2 border-primary border-opacity-25" value={editData.year_level} onChange={handleEditChange} required min="1" max="6" />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted text-uppercase fw-bold mb-1">General Weighted Average (GWA)</label>
                                                        <input type="number" step="0.01" name="overall_gwa" className="form-control rounded-3 py-2 border-primary border-opacity-25" value={editData.overall_gwa} onChange={handleEditChange} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted text-uppercase fw-bold mb-1">Academic Standing</label>
                                                        <select name="academic_standing" className="form-select rounded-3 py-2 border-primary border-opacity-25" value={editData.academic_standing} onChange={handleEditChange}>
                                                            <option value="Regular">Regular</option>
                                                            <option value="Irregular">Irregular</option>
                                                            <option value="Probation">Probation</option>
                                                            <option value="Dismissed">Dismissed</option>
                                                            <option value="Returnee">Returnee</option>
                                                            <option value="Transferee">Transferee</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <button type="submit" className="btn btn-primary px-5 py-2 fw-bold" disabled={savingProfile}>
                                                        {savingProfile ? 'Saving...' : 'Save Academic Record'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    <div className="table-responsive bg-white rounded-4 border overflow-hidden">
                                        <table className="table table-hover align-middle border-0 mb-0">
                                            <thead className="bg-light">
                                                <tr className="small text-uppercase text-muted fw-bold">
                                                    <th className="ps-3 border-0">Term</th>
                                                    <th className="border-0">Course/Program</th>
                                                    <th className="border-0 text-center">Year</th>
                                                    <th className="border-0 text-center">GWA</th>
                                                    <th className="border-0 text-end pe-3">Standing</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {student.academic_records?.map(rec => (
                                                    <tr key={rec.id}>
                                                        <td className="ps-3 small fw-bold">{rec.semester || 'Current'}</td>
                                                        <td>{rec.course}</td>
                                                        <td className="text-center">{rec.year_level}</td>
                                                        <td className="text-center fw-bold text-primary">{rec.gwa}</td>
                                                        <td className="text-end pe-3">
                                                            <span className={`badge rounded-pill ${rec.academic_standing === 'Regular' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                {rec.academic_standing}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!student.academic_records || student.academic_records.length === 0) && (
                                                    <tr><td colSpan="5" className="text-center py-5 text-muted">No academic records found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'non-academic' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-trophy-fill text-primary me-2"></i> Non-Academic Activities</h5>
                                    
                                    <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest mt-4">Event Participations</h6>
                                    <div className="row g-3 mb-5">
                                        {student.participatingEvents?.map(ev => (
                                            <div className="col-md-6" key={ev.id}>
                                                <div className="p-3 bg-light rounded-4 border">
                                                    <div className="fw-bold">{ev.event_name}</div>
                                                    <div className="small text-muted">{ev.pivot?.role || 'Participant'}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!student.participatingEvents || student.participatingEvents.length === 0) && (
                                            <div className="col-12"><div className="p-4 text-center rounded-4 border border-dashed text-muted small">No event participations recorded.</div></div>
                                        )}
                                    </div>

                                    <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest mt-4">Achievements & Awards</h6>
                                    <div className="list-group list-group-flush border rounded-4 overflow-hidden">
                                        {student.achievements?.map(ach => (
                                            <div className="list-group-item p-3 d-flex justify-content-between align-items-center" key={ach.id}>
                                                <div>
                                                    <div className="fw-bold">{ach.achievement_title}</div>
                                                    <div className="small text-muted">{ach.date_received}</div>
                                                </div>
                                                <i className="bi bi-award text-warning fs-4"></i>
                                            </div>
                                        ))}
                                        {(!student.achievements || student.achievements.length === 0) && (
                                            <div className="p-4 text-center text-muted small">No achievements listed.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'violations' && (
                                <div className="fade-in">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0 text-dark"><i className="bi bi-exclamation-octagon-fill text-danger me-2"></i> Disciplinary Violations</h5>
                                        <button className="btn btn-sm btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={() => setShowVioForm(!showVioForm)}>
                                            {showVioForm ? 'Cancel' : '+ Record Incident'}
                                        </button>
                                    </div>

                                    {showVioForm && (
                                        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-danger bg-opacity-10 border-start border-danger border-4">
                                            <div className="card-body p-4">
                                                <form onSubmit={handleAddViolation}>
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label small fw-bold">Incident Type</label>
                                                            <input type="text" className="form-control border-0 shadow-sm rounded-3 px-3 py-2" required value={newVio.violation_type} onChange={e => setNewVio({ ...newVio, violation_type: e.target.value })} placeholder="e.g. Absenteeism, Misconduct" />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label small fw-bold">Severity</label>
                                                            <select className="form-select border-0 shadow-sm rounded-3" value={newVio.severity_level} onChange={e => setNewVio({ ...newVio, severity_level: e.target.value })}>
                                                                <option value="Minor">Minor</option>
                                                                <option value="Major">Major</option>
                                                                <option value="Grave">Grave</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label small fw-bold">Incident Date</label>
                                                            <input type="date" className="form-control border-0 shadow-sm rounded-3" value={newVio.date_of_violation} onChange={e => setNewVio({ ...newVio, date_of_violation: e.target.value })} />
                                                        </div>
                                                        <div className="col-12 text-end">
                                                            <button type="submit" className="btn btn-danger rounded-pill px-5 fw-bold mt-2 shadow-sm">File Report</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead>
                                                <tr className="small text-muted border-top-0">
                                                    <th>Description</th>
                                                    <th>Severity</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {student.violations?.map(v => (
                                                    <tr key={v.id}>
                                                        <td><div className="fw-bold small">{v.violation_type}</div></td>
                                                        <td>
                                                            <span className={`badge rounded-pill ${v.severity_level === 'Grave' ? 'bg-dark' : (v.severity_level === 'Major' ? 'bg-danger' : 'bg-warning text-dark')}`}>
                                                                {v.severity_level}
                                                            </span>
                                                        </td>
                                                        <td className="small">{v.date_of_violation || 'N/A'}</td>
                                                        <td><span className="badge bg-light text-secondary border font-monospace x-small">PENDING</span></td>
                                                    </tr>
                                                ))}
                                                {(!student.violations || student.violations.length === 0) && (
                                                    <tr><td colSpan="4" className="text-center py-5 text-muted small"><i className="bi bi-shield-check display-4 d-block mb-3 text-success opacity-50"></i> Clear Disciplinary Record</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'skills' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-lightning-charge-fill text-primary me-2"></i> Skills & Proficiency</h5>
                                    <div className="row g-4">
                                        {student.skills?.map(sk => (
                                            <div className="col-md-6" key={sk.id}>
                                                <div className="p-3 border rounded-4 bg-white shadow-sm d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-bold">{sk.skill_name}</div>
                                                        <div className="text-muted small">{sk.skill_type || 'General'}</div>
                                                    </div>
                                                    <div className="text-primary fw-bold small">{sk.pivot?.proficiency_level || 'N/A'}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!student.skills || student.skills.length === 0) && (
                                            <div className="col-12 text-center py-5 text-muted">No skills listed for this profile.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'affiliations' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-people-fill text-primary me-2"></i> Organizational Affiliations</h5>
                                    <div className="row g-4">
                                        {student.organizations?.map(org => (
                                            <div className="col-md-6" key={org.id}>
                                                <div className="p-4 rounded-4 bg-white border shadow-sm">
                                                    <h5 className="fw-bold mb-1">{org.org_name}</h5>
                                                    <div className="badge bg-light text-primary border mb-3">{org.pivot?.position || 'Member'}</div>
                                                    <div className="small text-muted"><i className="bi bi-calendar-event me-2"></i> Active: {org.pivot?.years_active || 'N/A'}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!student.organizations || student.organizations.length === 0) && (
                                            <div className="col-12 text-center py-5 text-muted">No organizational affiliations listed.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'physical' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-body-text text-primary me-2"></i> Physical Profiling Matrix</h5>
                                    <div className="row g-4">
                                        <div className="col-md-3">
                                            <div className="p-4 rounded-4 bg-light border text-center">
                                                <div className="small text-muted mb-1 text-uppercase fw-bold">Height</div>
                                                <h3 className="fw-bold mb-0 text-dark">{student.physical_profile?.height || '---'}</h3>
                                                <div className="small text-muted">cm</div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-4 rounded-4 bg-light border text-center">
                                                <div className="small text-muted mb-1 text-uppercase fw-bold">Weight</div>
                                                <h3 className="fw-bold mb-0 text-dark">{student.physical_profile?.weight || '---'}</h3>
                                                <div className="small text-muted">kg</div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-4 rounded-4 bg-primary bg-opacity-10 border-primary border-opacity-20 text-center">
                                                <div className="small text-primary mb-1 text-uppercase fw-bold">BMI Index</div>
                                                <h3 className="fw-bold mb-0 text-primary">{student.physical_profile?.bmi || '---'}</h3>
                                                <div className="small text-primary">{student.physical_profile?.bmi < 18.5 ? 'Underweight' : (student.physical_profile?.bmi < 25 ? 'Normal' : 'Overweight')}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-4 rounded-4 bg-light border text-center">
                                                <div className="small text-muted mb-1 text-uppercase fw-bold">Body Type</div>
                                                <h5 className="fw-bold mb-0 text-dark">{student.physical_profile?.body_measurements || 'Standard'}</h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 rounded-4 border bg-white shadow-none">
                                        <h6 className="fw-bold mb-3 border-bottom pb-2">Institutional Identification Image Status</h6>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`p-2 rounded-circle ${student.physical_profile?.image_presence ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${student.physical_profile?.image_presence ? 'success' : 'danger'}`}>
                                                <i className={`bi ${student.physical_profile?.image_presence ? 'bi-check-circle' : 'bi-x-circle'} fs-3`}></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold">{student.physical_profile?.image_presence ? 'Official Snapshot Captured' : 'Official Image Missing'}</div>
                                                <div className="small text-muted">Required for building the digital university credential.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'medical' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-heart-pulse-fill text-danger me-2"></i> Medical Clearance & Health Status</h5>
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <div className="p-4 rounded-4 border bg-light h-100">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted border-bottom pb-2">Clinical vitals</h6>
                                                <div className="row">
                                                    <div className="col-6 mb-3">
                                                        <label className="d-block small text-muted">Blood Type</label>
                                                        <span className="fw-bold fs-5 text-danger">{student.medical_records?.[0]?.blood_type || 'Unknown'}</span>
                                                    </div>
                                                    <div className="col-6 mb-3">
                                                        <label className="d-block small text-muted">PWD/Disability</label>
                                                        <span className="fw-bold">{student.medical_records?.[0]?.disability || 'None'}</span>
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="d-block small text-muted">Allergies</label>
                                                        <span className="fw-bold text-dark">{student.medical_records?.[0]?.allergies || 'No known allergies'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="p-4 rounded-4 border border-danger border-opacity-25 bg-danger bg-opacity-10 h-100">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-danger border-bottom border-danger border-opacity-20 pb-2">Emergency protocol</h6>
                                                <div className="mb-3">
                                                    <label className="d-block small text-danger text-opacity-75">Primary Contact Person</label>
                                                    <span className="fw-bold text-danger">{student.medical_records?.[0]?.emergency_name || student.guardians?.father_name || 'Not Assigned'}</span>
                                                </div>
                                                <div>
                                                    <label className="d-block small text-danger text-opacity-75">Emergency Number</label>
                                                    <span className="fw-bold text-danger fs-5">{student.medical_records?.[0]?.emergency_contact || student.guardians?.guardian_contact || 'None'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-4 border bg-light">
                                        <h6 className="fw-bold mb-2">Medical History & Chronic Conditions</h6>
                                        <p className="text-muted small mb-0">{student.medical_records?.[0]?.chronic_illness || 'Records show no persistent chronic complications or reported long-term illnesses requiring institutional monitoring.'}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'behavioral' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-chat-dots-fill text-warning me-2"></i> Behavioral Profile & Guidance Monitoring</h5>
                                    
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-4">
                                            <div className="p-4 rounded-4 bg-white border shadow-sm text-center">
                                                <div className="circular-progress mx-auto mb-3 d-flex align-items-center justify-content-center border border-5 border-success rounded-circle" style={{ width: '80px', height: '80px' }}>
                                                    <span className="fw-bold text-success fs-5">{student.behavioral_profile?.attendance_percentage || '100'}%</span>
                                                </div>
                                                <div className="small text-muted fw-bold text-uppercase">Attendance Rate</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-4 rounded-4 bg-white border shadow-sm text-center">
                                                <div className="circular-progress mx-auto mb-3 d-flex align-items-center justify-content-center border border-5 border-primary rounded-circle" style={{ width: '80px', height: '80px' }}>
                                                    <span className="fw-bold text-primary fs-5">{student.behavioral_profile?.punctuality_rating || '5.0'}</span>
                                                </div>
                                                <div className="small text-muted fw-bold text-uppercase">Punctuality Score</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-4 rounded-4 bg-white border shadow-sm text-center">
                                                <div className="circular-progress mx-auto mb-3 d-flex align-items-center justify-content-center border border-5 border-info rounded-circle" style={{ width: '80px', height: '80px' }}>
                                                    <span className="fw-bold text-info fs-5">{student.behavioral_profile?.overall_rating || 'Good'}</span>
                                                </div>
                                                <div className="small text-muted fw-bold text-uppercase">Peer Evaluation</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card border-0 rounded-4 overflow-hidden shadow-none border">
                                         <div className="card-header bg-light py-3">
                                             <h6 className="fw-bold mb-0 text-dark">Psychological & Personality Traits</h6>
                                         </div>
                                         <div className="card-body p-4">
                                             <div className="row mb-4">
                                                 <div className="col-6 mb-3">
                                                     <label className="d-block small text-muted text-uppercase fw-bold mb-1">Personality Type</label>
                                                     <span className="badge bg-secondary rounded-pill px-3 py-2">{student.behavioral_profile?.personality_type || 'Ambivert'}</span>
                                                 </div>
                                                 <div className="col-6 mb-3">
                                                     <label className="d-block small text-muted text-uppercase fw-bold mb-1">Communication Rating</label>
                                                     <div className="d-flex text-warning">
                                                         {[1,2,3,4,5].map(s => <i key={s} className="bi bi-star-fill me-1"></i>)}
                                                     </div>
                                                 </div>
                                             </div>
                                             <label className="d-block small text-muted text-uppercase fw-bold mb-2">Guidance Counselor Remarks</label>
                                             <div className="p-3 rounded-3 bg-light border-start border-4 border-primary italic">
                                                 "{student.behavioral_profile?.behavioral_remarks || 'Student demonstrates stable emotional intelligence and adaptive social skills within the campus environment.'}"
                                             </div>
                                         </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-file-earmark-check-fill text-primary me-2"></i> Document Verification Queue</h5>
                                    
                                    <div className="alert alert-info border-0 rounded-4 mb-4 small">
                                        <i className="bi bi-info-circle me-2"></i> These documents are uploaded by the student for institutional verification. Review them carefully before approval.
                                    </div>

                                    <div className="table-responsive bg-white rounded-4 border overflow-hidden">
                                        <table className="table table-hover align-middle border-0 mb-0">
                                            <thead className="bg-light">
                                                <tr className="small text-uppercase text-muted fw-bold">
                                                    <th className="ps-4 border-0">Document Type</th>
                                                    <th className="border-0">Status</th>
                                                    <th className="border-0">Last Submitted</th>
                                                    <th className="border-0 text-end pe-4">Institutional Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {student.user?.document_submissions?.map(doc => (
                                                    <tr key={doc.id}>
                                                        <td className="ps-4">
                                                            <div className="fw-bold text-dark">{doc.type?.name || 'Requirement'}</div>
                                                            <a href={`${api.defaults.baseURL.replace('/api', '')}/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="small text-decoration-none">
                                                                <i className="bi bi-file-earmark-pdf me-1"></i> Open Document File
                                                            </a>
                                                        </td>
                                                        <td>
                                                            <span className={`badge rounded-pill px-3 py-2 ${
                                                                doc.status === 'approved' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 
                                                                (doc.status === 'pending' ? 'bg-warning bg-opacity-10 text-dark border border-warning border-opacity-50' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25')
                                                            }`}>
                                                                {doc.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="small text-muted">
                                                            {new Date(doc.updated_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex gap-2 justify-content-end">
                                                                <button 
                                                                    className="btn btn-sm btn-success rounded-pill px-3 shadow-none border-0" 
                                                                    disabled={doc.status === 'approved' || actionLoadingDoc === doc.id}
                                                                    onClick={() => handleApproveDoc(doc.id)}
                                                                >
                                                                    {actionLoadingDoc === doc.id ? <span className="spinner-border spinner-border-sm"></span> : 'Approve'}
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3 border-0"
                                                                    disabled={doc.status === 'rejected' || actionLoadingDoc === doc.id}
                                                                    onClick={() => setRejectDocData(doc)}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!student.user?.document_submissions || student.user.document_submissions.length === 0) && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-5 text-muted">
                                                            <i className="bi bi-journal-x display-4 d-block mb-3 opacity-25"></i>
                                                            No document submissions found for this profile.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Sub-modal/Inline rejection for documents */}
                                    {rejectDocData && (
                                        <div className="mt-4 p-4 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 fade-in">
                                            <h6 className="fw-bold text-danger mb-3">Rejection Remarks for {rejectDocData.type?.name}</h6>
                                            <form onSubmit={handleRejectDoc}>
                                                <textarea 
                                                    className="form-control border-0 shadow-sm rounded-4 mb-3" 
                                                    rows="3" 
                                                    placeholder="Reason for rejection (e.g. Blurry image, Wrong document)..."
                                                    value={rejectRemarks}
                                                    onChange={e => setRejectRemarks(e.target.value)}
                                                    required
                                                ></textarea>
                                                <div className="d-flex gap-2">
                                                    <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold" disabled={actionLoadingDoc === rejectDocData.id}>Submit Rejection</button>
                                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => { setRejectDocData(null); setRejectRemarks(''); }}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
