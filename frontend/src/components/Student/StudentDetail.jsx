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

    // Determine latest academic record for summary
    const academicRecords = student.academic_records || [];
    const latestRecord = academicRecords[0] || {};

    const riskLevel = student.risk_indicators_json?.length > 0 ? 'High' : ((latestRecord.gwa > 2.5) ? 'High' : (latestRecord.gwa > 2.0 ? 'Medium' : 'Low'));

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
                                    {latestRecord.course || 'No Course'}
                                </div>
                            </div>

                            <div className="text-start px-2">
                                <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2">Primary Info</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="p-3 bg-light rounded-4 h-100 border border-white">
                                            <div className="small text-muted mb-1">Year Level</div>
                                            <h5 className="fw-bold mb-0">{latestRecord.year_level || 'N/A'}</h5>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 bg-light rounded-4 h-100 border border-white">
                                            <div className="small text-muted mb-1">Current GWA</div>
                                            <h5 className="fw-bold mb-0 text-primary">{latestRecord.gwa || 'N/A'}</h5>
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
                                    { id: 'personal', label: '1. Personal & Physical', icon: 'bi-person' },
                                    { id: 'academic', label: '2. Academic', icon: 'bi-book' },
                                    { id: 'education', label: '3. Education', icon: 'bi-mortarboard' },
                                    { id: 'non-academic', label: '4. Non-Academic', icon: 'bi-trophy' },
                                    { id: 'violations', label: '5. Violations', icon: 'bi-exclamation-octagon' },
                                    { id: 'skills', label: '6. Skills & Talents', icon: 'bi-lightning' },
                                    { id: 'medical', label: '7. Medical History', icon: 'bi-heart-pulse' }
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
                                            <div className="p-4 rounded-4 bg-light bg-opacity-50 border mb-3">
                                                <h6 className="fw-bold text-muted small mb-3"><i className="bi bi-person-fill me-1"></i>Father's Information</h6>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Full Name</label><div className="fw-bold">{student.guardians?.father_name || 'N/A'}</div></div>
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Occupation</label><div className="fw-bold">{student.guardians?.father_occupation || 'N/A'}</div></div>
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Contact No.</label><div className="fw-bold">{student.guardians?.father_contact || 'N/A'}</div></div>
                                                </div>
                                                <hr className="opacity-10" />
                                                <h6 className="fw-bold text-muted small mb-3"><i className="bi bi-person-fill me-1"></i>Mother's Information</h6>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Full Name</label><div className="fw-bold">{student.guardians?.mother_name || 'N/A'}</div></div>
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Occupation</label><div className="fw-bold">{student.guardians?.mother_occupation || 'N/A'}</div></div>
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Contact No.</label><div className="fw-bold">{student.guardians?.mother_contact || 'N/A'}</div></div>
                                                </div>
                                                <hr className="opacity-10" />
                                                <h6 className="fw-bold text-muted small mb-3"><i className="bi bi-shield-fill-check me-1"></i>Guardian & Emergency</h6>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Guardian Name</label><div className="fw-bold">{student.guardians?.guardian_name || 'N/A'}</div></div>
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Guardian Contact</label><div className="fw-bold">{student.guardians?.guardian_contact || 'N/A'}</div></div>
                                                    <div className="col-md-4"><label className="small text-muted d-block mb-1">Emergency Contact</label><div className="fw-bold text-danger">{student.guardians?.emergency_contact || 'N/A'}</div></div>
                                                </div>
                                                <hr className="opacity-10" />
                                                <h6 className="fw-bold text-muted small mb-3"><i className="bi bi-house-fill me-1"></i>Household</h6>
                                                <div className="row g-3">
                                                    <div className="col-md-6"><label className="small text-muted d-block mb-1">Family Income Bracket</label><div className="fw-bold">{student.guardians?.family_income_bracket || 'N/A'}</div></div>
                                                    <div className="col-md-6"><label className="small text-muted d-block mb-1">Living Status</label><div className="fw-bold">{student.guardians?.living_status || 'N/A'}</div></div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <h6 className="fw-bold mb-3 mt-5 text-muted small text-uppercase tracking-widest border-bottom pb-2">Physical Profiling System</h6>
                                    <div className="row g-4 mb-4">
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
                                            <div className="p-4 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-20 text-center">
                                                <div className="small text-primary mb-1 text-uppercase fw-bold">BMI Index</div>
                                                <h3 className="fw-bold mb-0 text-primary">
                                                    {student.physical_profile?.height && student.physical_profile?.weight 
                                                        ? (student.physical_profile.weight / ((student.physical_profile.height / 100) ** 2)).toFixed(1) 
                                                        : '---'}
                                                </h3>
                                                <div className="small text-primary">
                                                    {student.physical_profile?.height && student.physical_profile?.weight ? (() => {
                                                        const bmi = student.physical_profile.weight / ((student.physical_profile.height / 100) ** 2);
                                                        if (bmi < 18.5) return 'Underweight';
                                                        if (bmi < 25) return 'Normal Weight';
                                                        if (bmi < 30) return 'Overweight';
                                                        return 'Obese';
                                                    })() : '---'}
                                                </div>
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

                            {activeTab === 'education' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-mortarboard-fill text-primary me-2"></i> Educational Background</h5>
                                    <p className="small text-muted mb-4">Pre-college educational history as submitted by the student.</p>
                                    
                                    {/* Elementary */}
                                    <div className="p-4 rounded-4 mb-3" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><i className="bi bi-book text-warning"></i>Elementary School</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6"><label className="small text-muted d-block mb-1">School Name</label><div className="fw-bold">{student.elementary_school || 'Not provided'}</div></div>
                                            <div className="col-md-6"><label className="small text-muted d-block mb-1">Year Graduated</label><div className="fw-bold">{student.elementary_year_graduated || 'N/A'}</div></div>
                                            <div className="col-12"><label className="small text-muted d-block mb-1">Awards / Honors</label><div className="fw-bold">{student.elementary_awards || 'None listed'}</div></div>
                                        </div>
                                    </div>

                                    {/* Junior High */}
                                    <div className="p-4 rounded-4 mb-3" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><i className="bi bi-journal-text text-success"></i>Junior High School</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6"><label className="small text-muted d-block mb-1">School Name</label><div className="fw-bold">{student.junior_high_school || 'Not provided'}</div></div>
                                            <div className="col-md-6"><label className="small text-muted d-block mb-1">Year Graduated</label><div className="fw-bold">{student.junior_high_year_graduated || 'N/A'}</div></div>
                                            <div className="col-12"><label className="small text-muted d-block mb-1">Awards / Honors</label><div className="fw-bold">{student.junior_high_awards || 'None listed'}</div></div>
                                        </div>
                                    </div>

                                    {/* Senior High */}
                                    <div className="p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><i className="bi bi-building text-primary"></i>Senior High School</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6"><label className="small text-muted d-block mb-1">School Name</label><div className="fw-bold">{student.senior_high_school || 'Not provided'}</div></div>
                                            <div className="col-md-6"><label className="small text-muted d-block mb-1">Year Graduated</label><div className="fw-bold">{student.senior_high_year_graduated || 'N/A'}</div></div>
                                            <div className="col-12"><label className="small text-muted d-block mb-1">Awards / Honors</label><div className="fw-bold">{student.senior_high_awards || 'None listed'}</div></div>
                                        </div>
                                    </div>

                                    {!student.elementary_school && !student.junior_high_school && !student.senior_high_school && (
                                        <div className="text-center text-muted py-5 mt-4 rounded-4 border border-dashed bg-light">
                                            <i className="bi bi-mortarboard display-4 d-block mb-3 opacity-25"></i>
                                            Student has not yet submitted their educational background.
                                        </div>
                                    )}
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
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-lightning-charge-fill text-primary me-2"></i> Skills & Talents</h5>
                                    <p className="small text-muted mb-4">Skills and talents selected by the student from their profile.</p>

                                    <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2"><i className="bi bi-gear-fill me-1"></i>Skills</h6>
                                    <div className="d-flex flex-wrap gap-2 mb-5">
                                        {student.skills?.map(sk => (
                                            <span key={sk.skill_id} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 fw-medium">
                                                <i className="bi bi-check-circle-fill me-1"></i>{sk.skill_name}
                                                <span className="ms-2 badge bg-success bg-opacity-25 rounded-pill" style={{ fontSize: '0.6rem' }}>{sk.skill_type || 'General'}</span>
                                            </span>
                                        ))}
                                        {(!student.skills || student.skills.length === 0) && (
                                            <div className="text-center text-muted py-4 w-100 rounded-4 border border-dashed bg-light">
                                                <i className="bi bi-lightning display-6 d-block mb-2 opacity-25"></i>
                                                No skills selected by the student.
                                            </div>
                                        )}
                                    </div>

                                    <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2"><i className="bi bi-star-fill me-1"></i>Talents</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {student.talents?.map(t => (
                                            <span key={t.talent_id} className="badge bg-opacity-10 text-white border rounded-pill px-3 py-2 fw-medium" style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}>
                                                <i className="bi bi-check-circle-fill me-1"></i>{t.talent_name}
                                            </span>
                                        ))}
                                        {(!student.talents || student.talents.length === 0) && (
                                            <div className="text-center text-muted py-4 w-100 rounded-4 border border-dashed bg-light">
                                                <i className="bi bi-star display-6 d-block mb-2 opacity-25"></i>
                                                No talents selected by the student.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}







                            {activeTab === 'medical' && (
                                <div className="fade-in">
                                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-heart-pulse-fill text-primary me-2"></i> Comprehensive Medical History</h5>
                                    
                                    <div className="alert alert-info border-0 rounded-4 mb-5 small">
                                        <i className="bi bi-shield-check-fill me-2"></i> This information is provided by the student for institutional health profiling and emergency response readiness.
                                    </div>

                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <div className="p-4 rounded-4 bg-light border text-center">
                                                <div className="small text-muted mb-1 text-uppercase fw-bold tracking-wider">Blood Type</div>
                                                <h2 className="fw-bold mb-0 text-danger">{student.blood_type || '---'}</h2>
                                            </div>
                                        </div>
                                        
                                        <div className="col-12">
                                            <div className="p-4 rounded-4 bg-white border border-light shadow-sm">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2">Medical Conditions & History</h6>
                                                <div className="bg-light p-3 rounded-3 mb-0" style={{ minHeight: '80px' }}>
                                                    {student.medical_history ? <p className="mb-0">{student.medical_history}</p> : <p className="text-muted italic mb-0">No medical history recorded.</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="p-4 rounded-4 bg-white border border-light shadow-sm h-100">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2">Allergies</h6>
                                                <div className="bg-light p-3 rounded-3" style={{ minHeight: '60px' }}>
                                                    {student.allergies ? <p className="mb-0 text-danger fw-medium">{student.allergies}</p> : <p className="text-muted italic mb-0">No known allergies.</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="p-4 rounded-4 bg-white border border-light shadow-sm h-100">
                                                <h6 className="fw-bold mb-3 small text-uppercase text-muted tracking-widest border-bottom pb-2">Current Medications</h6>
                                                <div className="bg-light p-3 rounded-3" style={{ minHeight: '60px' }}>
                                                    {student.medications ? <p className="mb-0">{student.medications}</p> : <p className="text-muted italic mb-0">No current medications.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
