import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

/* ─────────────────── Section Tab Definitions ─────────────────── */
const TABS = [
    { key: 'personal', label: 'Personal Info', icon: 'bi-person-fill' },
    { key: 'contact', label: 'Contact Info', icon: 'bi-telephone-fill' },
    { key: 'family', label: 'Family Background', icon: 'bi-people-fill' },
    { key: 'education', label: 'Education', icon: 'bi-mortarboard-fill' },
    { key: 'skills', label: 'Skills & Talents', icon: 'bi-lightning-charge-fill' },
    { key: 'medical', label: 'Medical History', icon: 'bi-heart-pulse-fill' },
];

/* ─────────────────── Helper: Section Card ─────────────────── */
const SectionCard = ({ icon, title, children, badge }) => (
    <div className="card shadow-sm border-0 rounded-4 mb-4 animate-slide-up overflow-hidden">
        <div className="card-header bg-white border-0 px-4 pt-4 pb-0 d-flex align-items-center justify-content-between">
            <h6 className="fw-bold text-dark mb-0"><i className={`bi ${icon} me-2 text-primary`}></i>{title}</h6>
            {badge}
        </div>
        <div className="card-body px-4 pb-4 pt-3">{children}</div>
    </div>
);

/* ─────────────────── Helper: Input Field ─────────────────── */
const Field = ({ label, name, value, onChange, disabled, type = 'text', placeholder, required, children }) => (
    <div className="col-md-6">
        <label className="form-label small text-muted mb-1 fw-semibold">{label}{required && <span className="text-danger ms-1">*</span>}</label>
        {children || (
            <input
                type={type}
                name={name}
                className={`form-control rounded-3 py-2 ${disabled ? 'bg-light' : 'border-primary border-opacity-50'}`}
                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
            />
        )}
    </div>
);

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('personal');
    const [profileSubmitted, setProfileSubmitted] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [docLabel, setDocLabel] = useState('');
    const docInputRef = useRef(null);

    // All skills & talents available
    const [allSkills, setAllSkills] = useState([]);
    const [allTalents, setAllTalents] = useState([]);
    const [documents, setDocuments] = useState([]);

    // Form state
    const [form, setForm] = useState({
        nickname: '', gender: '', birthdate: '', civil_status: 'Single',
        nationality: 'Filipino', religion: '',
        contact_number: '', email: '', present_address: '', permanent_address: '',
        father_name: '', father_occupation: '', father_contact: '',
        mother_name: '', mother_occupation: '', mother_contact: '',
        guardian_name: '', guardian_contact: '', emergency_contact: '',
        family_income_bracket: '', living_status: '',
        elementary_school: '', elementary_year_graduated: '', elementary_awards: '',
        junior_high_school: '', junior_high_year_graduated: '', junior_high_awards: '',
        senior_high_school: '', senior_high_year_graduated: '', senior_high_awards: '',
        skill_ids: [], talent_ids: [],
        blood_type: '', medical_history: '', allergies: '', medications: '',
    });
    const [emergencySource, setEmergencySource] = useState(''); // 'father', 'mother', 'guardian', or ''

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userLocal = JSON.parse(localStorage.getItem('user') || '{}');

            // For faculty, use the old profile endpoint
            if (userLocal.role === 'faculty') {
                const res = await api.get('/profile');
                setUser(res.data);
                setLoading(false);
                return;
            }

            const res = await api.get('/student/my-profile');
            const d = res.data;
            setUser({ ...d.user, student: d.student });
            setProfileSubmitted(d.profile_submitted);
            setAllSkills(d.all_skills || []);
            setAllTalents(d.all_talents || []);
            setDocuments(d.documents || []);

            const s = d.student || {};
            const g = d.guardian || {};
            const pp = d.physical_profile || {};

            setForm({
                nickname: s.nickname || '',
                gender: s.gender || '',
                birthdate: s.birthdate || '',
                civil_status: s.civil_status || 'Single',
                nationality: s.nationality || 'Filipino',
                religion: s.religion || '',
                contact_number: s.contact_number || '',
                email: s.email || '',
                present_address: s.present_address || '',
                permanent_address: s.permanent_address || '',
                father_name: g.father_name || '',
                father_occupation: g.father_occupation || '',
                father_contact: g.father_contact || '',
                mother_name: g.mother_name || '',
                mother_occupation: g.mother_occupation || '',
                mother_contact: g.mother_contact || '',
                guardian_name: g.guardian_name || '',
                guardian_contact: g.guardian_contact || '',
                emergency_contact: g.emergency_contact || '',
                family_income_bracket: g.family_income_bracket || '',
                living_status: g.living_status || '',
                elementary_school: s.elementary_school || '',
                elementary_year_graduated: s.elementary_year_graduated || '',
                elementary_awards: s.elementary_awards || '',
                junior_high_school: s.junior_high_school || '',
                junior_high_year_graduated: s.junior_high_year_graduated || '',
                junior_high_awards: s.junior_high_awards || '',
                senior_high_school: s.senior_high_school || '',
                senior_high_year_graduated: s.senior_high_year_graduated || '',
                senior_high_awards: s.senior_high_awards || '',
                height: pp.height || '',
                weight: pp.weight || '',
                skill_ids: d.student_skill_ids || [],
                talent_ids: d.student_talent_ids || [],
                blood_type: s.blood_type || '',
                medical_history: s.medical_history || '',
                allergies: s.allergies || '',
                medications: s.medications || '',
            });
        } catch (err) {
            console.error('Failed to fetch profile', err);
            setMessage({ text: 'Failed to load profile data.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    // Keep emergency contact in sync if source changes
    useEffect(() => {
        if (!emergencySource || isLocked) return;
        let contact = '';
        if (emergencySource === 'father') contact = form.father_contact;
        else if (emergencySource === 'mother') contact = form.mother_contact;
        else if (emergencySource === 'guardian') contact = form.guardian_contact;
        
        if (contact && contact !== form.emergency_contact) {
            setForm(prev => ({ ...prev, emergency_contact: contact }));
        }
    }, [form.father_contact, form.mother_contact, form.guardian_contact, emergencySource]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const toggleSkill = (id) => {
        if (profileSubmitted) return;
        setForm(prev => ({
            ...prev,
            skill_ids: prev.skill_ids.includes(id)
                ? prev.skill_ids.filter(x => x !== id)
                : [...prev.skill_ids, id]
        }));
    };

    const toggleTalent = (id) => {
        if (profileSubmitted) return;
        setForm(prev => ({
            ...prev,
            talent_ids: prev.talent_ids.includes(id)
                ? prev.talent_ids.filter(x => x !== id)
                : [...prev.talent_ids, id]
        }));
    };

    /* ─── Save Draft ─── */
    const handleSaveDraft = async () => {
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/student/my-profile/draft', form);
            setMessage({ text: 'Draft saved successfully! You can continue editing later.', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to save draft.', type: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    /* ─── Submit Profile (locks editing) ─── */
    const handleSubmitProfile = async () => {
        setSubmitting(true);
        setMessage({ text: '', type: '' });
        setShowConfirmModal(false);
        try {
            await api.post('/student/my-profile/submit', form);
            setProfileSubmitted(true);
            setMessage({ text: 'Profile submitted successfully! Your information is now locked.', type: 'success' });
            fetchProfile();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to submit profile.', type: 'danger' });
        } finally {
            setSubmitting(false);
        }
    };

    /* ─── Profile Picture Upload ─── */
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append('profile_picture', file);
        setUploadingImage(true);
        try {
            const res = await api.post('/profile/picture', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const updatedUser = { ...user, profile_picture: res.data.profile_picture };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage({ text: 'Profile picture updated!', type: 'success' });
        } catch {
            setMessage({ text: 'Failed to upload profile picture.', type: 'danger' });
        } finally {
            setUploadingImage(false);
        }
    };

    const getProfileImageUrl = () => {
        if (!user?.profile_picture) return null;
        if (user.profile_picture.startsWith('http')) return user.profile_picture;
        return `${api.defaults.baseURL.replace('/api', '')}/storage/${user.profile_picture}`;
    };

    const isLocked = profileSubmitted;
    const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role;

    /* ─── Faculty Profile (simple) ─── */
    if (!loading && userRole === 'faculty') {
        return <FacultyProfile user={user} />;
    }

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                <p className="text-muted fw-medium">Loading your profile...</p>
            </div>
        </div>
    );

    /* ─── Completion Progress ─── */
    const completionFields = [
        form.gender, form.birthdate, form.contact_number, form.present_address,
        form.elementary_school, form.junior_high_school, form.senior_high_school,
        form.father_name, form.mother_name, form.height, form.weight,
    ];
    const filled = completionFields.filter(f => f && String(f).trim() !== '').length;
    const progress = Math.round((filled / completionFields.length) * 100);

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* ── Confirmation Modal ── */}
            {showConfirmModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                    <div className="card shadow-lg border-0 rounded-4 p-4 animate-slide-up" style={{ maxWidth: '480px', width: '90%' }}>
                        <div className="text-center mb-3">
                            <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-exclamation-triangle-fill text-warning fs-2"></i>
                            </div>
                            <h5 className="fw-bold">Submit Profile?</h5>
                            <p className="text-muted small mb-0">
                                Once submitted, you <strong>cannot edit</strong> your personal information, contact details, family background, educational history, skills, talents, height, or weight.
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-light flex-fill rounded-pill fw-bold" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            <button className="btn btn-primary flex-fill rounded-pill fw-bold" onClick={handleSubmitProfile} disabled={submitting}>
                                {submitting ? <span className="spinner-border spinner-border-sm"></span> : 'Yes, Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Profile Header Banner ── */}
            <div className="card border-0 rounded-4 mb-4 text-white overflow-hidden shadow" style={{ background: 'linear-gradient(135deg, #3b3aee 0%, #6366f1 50%, #8b5cf6 100%)' }}>
                <div className="position-absolute w-100 h-100" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)', top: 0, left: 0 }}></div>
                <div className="p-4 d-flex align-items-center position-relative">
                    <div className="position-relative me-4" style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                        {getProfileImageUrl() ? (
                            <img src={getProfileImageUrl()} alt="Profile" className="rounded-circle shadow object-fit-cover w-100 h-100 border border-3 border-white border-opacity-50" />
                        ) : (
                            <div className="bg-white bg-opacity-20 text-white fw-bold rounded-circle d-flex align-items-center justify-content-center shadow w-100 h-100 fs-1 border border-2 border-white border-opacity-25">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        <label className="position-absolute bottom-0 end-0 bg-white text-primary rounded-circle shadow d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px', cursor: 'pointer', zIndex: 2 }}>
                            <i className={uploadingImage ? 'spinner-border spinner-border-sm' : 'bi bi-camera-fill small'}></i>
                            <input type="file" className="d-none" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                    </div>
                    <div className="flex-grow-1">
                        <h3 className="fw-bold mb-1">{user?.name}</h3>
                        <div className="text-white text-opacity-75 mb-2 small">{user?.email}</div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1 fw-normal">
                                <i className="bi bi-mortarboard me-1"></i>Student
                            </span>
                            {isLocked ? (
                                <span className="badge bg-success bg-opacity-75 text-white rounded-pill px-3 py-1 fw-bold">
                                    <i className="bi bi-check-circle me-1"></i>Profile Submitted
                                </span>
                            ) : (
                                <span className="badge bg-warning bg-opacity-75 text-dark rounded-pill px-3 py-1 fw-bold">
                                    <i className="bi bi-pencil-square me-1"></i>Profile Incomplete
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Progress Ring */}
                    <div className="d-none d-md-flex flex-column align-items-center ms-3">
                        <div className="position-relative" style={{ width: '70px', height: '70px' }}>
                            <svg viewBox="0 0 36 36" className="w-100 h-100" style={{ transform: 'rotate(-90deg)' }}>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                            </svg>
                            <div className="position-absolute top-50 start-50 translate-middle text-white fw-bold small">{progress}%</div>
                        </div>
                        <span className="text-white text-opacity-75 mt-1" style={{ fontSize: '0.65rem' }}>COMPLETION</span>
                    </div>
                </div>
            </div>

            {/* ── Status Message ── */}
            {message.text && (
                <div className={`alert alert-${message.type} rounded-3 d-flex align-items-center gap-2 py-2 animate-slide-up`} role="alert">
                    <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                    {message.text}
                    <button className="btn-close ms-auto" style={{ fontSize: '0.7rem' }} onClick={() => setMessage({ text: '', type: '' })}></button>
                </div>
            )}

            {/* ── Locked Banner ── */}
            {isLocked && (
                <div className="alert alert-info border-0 rounded-4 d-flex align-items-center gap-3 py-3 px-4 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)', borderLeft: '4px solid #3b82f6 !important' }}>
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', flexShrink: 0 }}>
                        <i className="bi bi-lock-fill text-primary fs-5"></i>
                    </div>
                    <div>
                        <strong className="text-primary">Profile Locked</strong>
                        <p className="mb-0 small text-muted">Your profile has been submitted and is now read-only.</p>
                    </div>
                </div>
            )}

            {/* ── Tab Navigation ── */}
            <div className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="d-flex overflow-auto" style={{ scrollbarWidth: 'none' }}>
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`btn rounded-0 px-4 py-3 fw-semibold d-flex align-items-center gap-2 border-0 flex-shrink-0 ${activeTab === tab.key ? 'text-primary' : 'text-muted'}`}
                                style={{
                                    borderBottom: activeTab === tab.key ? '3px solid var(--ccs-primary)' : '3px solid transparent',
                                    backgroundColor: activeTab === tab.key ? 'rgba(243,112,33,0.04)' : 'transparent',
                                    transition: 'all 0.2s',
                                    fontSize: '0.85rem',
                                }}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <i className={`bi ${tab.icon}`}></i>
                                <span className="d-none d-lg-inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div key={activeTab} className="animate-slide-up">
                {/* PERSONAL INFO */}
                {activeTab === 'personal' && (
                    <SectionCard icon="bi-person-fill" title="Personal & Physical Information" badge={isLocked && <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3"><i className="bi bi-lock-fill me-1"></i>Locked</span>}>
                        <h6 className="fw-bold text-muted small text-uppercase mb-3 mt-1"><i className="bi bi-person-lines-fill me-1"></i> Basic Details</h6>
                        <div className="row g-3 mb-4">
                            <Field label="Full Name" value={user?.name} disabled={true} />
                            <Field label="Nickname" name="nickname" value={form.nickname} onChange={handleChange} disabled={isLocked} placeholder="Enter your nickname" />
                            <Field label="Gender" name="gender" value={form.gender} onChange={handleChange} disabled={isLocked}>
                                <select name="gender" className={`form-select rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} value={form.gender} onChange={handleChange} disabled={isLocked}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </Field>
                            <Field label="Birthdate" name="birthdate" type="date" value={form.birthdate} onChange={handleChange} disabled={isLocked} />
                            <Field label="Civil Status" name="civil_status" value={form.civil_status} onChange={handleChange} disabled={isLocked}>
                                <select name="civil_status" className={`form-select rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} value={form.civil_status} onChange={handleChange} disabled={isLocked}>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Divorced">Divorced</option>
                                </select>
                            </Field>
                            <Field label="Nationality" name="nationality" value={form.nationality} onChange={handleChange} disabled={isLocked} />
                            <Field label="Religion" name="religion" value={form.religion} onChange={handleChange} disabled={isLocked} placeholder="e.g. Roman Catholic" />
                        </div>

                        <h6 className="fw-bold text-muted small text-uppercase mb-3 border-top pt-4"><i className="bi bi-heart-pulse-fill me-1"></i> Physical Profile</h6>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small text-muted mb-1 fw-semibold">Height (cm)</label>
                                <div className="input-group">
                                    <span className="input-group-text rounded-start-3 bg-primary bg-opacity-10 border-primary border-opacity-25"><i className="bi bi-rulers text-primary"></i></span>
                                    <input type="number" name="height" className={`form-control rounded-end-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} placeholder="e.g. 165" value={form.height} onChange={handleChange} disabled={isLocked} min="0" max="300" step="0.01" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small text-muted mb-1 fw-semibold">Weight (kg)</label>
                                <div className="input-group">
                                    <span className="input-group-text rounded-start-3 bg-primary bg-opacity-10 border-primary border-opacity-25"><i className="bi bi-speedometer text-primary"></i></span>
                                    <input type="number" name="weight" className={`form-control rounded-end-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} placeholder="e.g. 60" value={form.weight} onChange={handleChange} disabled={isLocked} min="0" max="500" step="0.01" />
                                </div>
                            </div>
                            {form.height && form.weight && (
                                <div className="col-12 mt-3">
                                    <div className="card border-0 rounded-4 p-4 text-center" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                                        <div className="fw-bold text-success mb-1">BMI Estimate</div>
                                        <div className="display-6 fw-bold text-dark">{(form.weight / ((form.height / 100) ** 2)).toFixed(1)}</div>
                                        <div className="small text-muted mt-1">
                                            {(() => {
                                                const bmi = form.weight / ((form.height / 100) ** 2);
                                                if (bmi < 18.5) return 'Underweight';
                                                if (bmi < 25) return 'Normal Weight';
                                                if (bmi < 30) return 'Overweight';
                                                return 'Obese';
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* CONTACT INFO */}
                {activeTab === 'contact' && (
                    <SectionCard icon="bi-telephone-fill" title="Contact Information" badge={isLocked && <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3"><i className="bi bi-lock-fill me-1"></i>Locked</span>}>
                        <div className="row g-3">
                            <Field label="Contact Number" name="contact_number" value={form.contact_number} onChange={handleChange} disabled={isLocked} placeholder="e.g. 09171234567" required />
                            <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} disabled={isLocked} />
                            <div className="col-12">
                                <label className="form-label small text-muted mb-1 fw-semibold">Present Address<span className="text-danger ms-1">*</span></label>
                                <textarea name="present_address" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} rows="2" value={form.present_address} onChange={handleChange} disabled={isLocked} placeholder="Enter your current address"></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label small text-muted mb-1 fw-semibold">Permanent Address</label>
                                <textarea name="permanent_address" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} rows="2" value={form.permanent_address} onChange={handleChange} disabled={isLocked} placeholder="Enter your permanent address (if different)"></textarea>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* FAMILY BACKGROUND */}
                {activeTab === 'family' && (
                    <SectionCard icon="bi-people-fill" title="Family Background" badge={isLocked && <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3"><i className="bi bi-lock-fill me-1"></i>Locked</span>}>
                        <h6 className="fw-bold text-muted small text-uppercase ls-wider mb-3">Father's Information</h6>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small text-muted mb-0 fw-semibold">Father's Full Name</label>
                                    {!isLocked && (
                                        <div className="form-check form-check-inline small mb-0">
                                            <input className="form-check-input" type="checkbox" id="syncFather" checked={emergencySource === 'father'} onChange={() => setEmergencySource(prev => prev === 'father' ? '' : 'father')} />
                                            <label className="form-check-label text-muted x-small" htmlFor="syncFather">Set as Emergency Contact</label>
                                        </div>
                                    )}
                                </div>
                                <input type="text" name="father_name" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} value={form.father_name} onChange={handleChange} disabled={isLocked} />
                            </div>
                            <Field label="Father's Occupation" name="father_occupation" value={form.father_occupation} onChange={handleChange} disabled={isLocked} />
                            <Field label="Father's Contact Number" name="father_contact" value={form.father_contact} onChange={handleChange} disabled={isLocked} />
                        </div>
                        <hr className="my-3 opacity-10" />
                        <h6 className="fw-bold text-muted small text-uppercase ls-wider mb-3">Mother's Information</h6>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small text-muted mb-0 fw-semibold">Mother's Full Name</label>
                                    {!isLocked && (
                                        <div className="form-check form-check-inline small mb-0">
                                            <input className="form-check-input" type="checkbox" id="syncMother" checked={emergencySource === 'mother'} onChange={() => setEmergencySource(prev => prev === 'mother' ? '' : 'mother')} />
                                            <label className="form-check-label text-muted x-small" htmlFor="syncMother">Set as Emergency Contact</label>
                                        </div>
                                    )}
                                </div>
                                <input type="text" name="mother_name" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} value={form.mother_name} onChange={handleChange} disabled={isLocked} />
                            </div>
                            <Field label="Mother's Occupation" name="mother_occupation" value={form.mother_occupation} onChange={handleChange} disabled={isLocked} />
                            <Field label="Mother's Contact Number" name="mother_contact" value={form.mother_contact} onChange={handleChange} disabled={isLocked} />
                        </div>
                        <hr className="my-3 opacity-10" />
                        <h6 className="fw-bold text-muted small text-uppercase ls-wider mb-3">Guardian & Emergency</h6>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small text-muted mb-0 fw-semibold">Guardian's Name</label>
                                    {!isLocked && (
                                        <div className="form-check form-check-inline small mb-0">
                                            <input className="form-check-input" type="checkbox" id="syncGuardian" checked={emergencySource === 'guardian'} onChange={() => setEmergencySource(prev => prev === 'guardian' ? '' : 'guardian')} />
                                            <label className="form-check-label text-muted x-small" htmlFor="syncGuardian">Set as Emergency Contact</label>
                                        </div>
                                    )}
                                </div>
                                <input type="text" name="guardian_name" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} value={form.guardian_name} onChange={handleChange} disabled={isLocked} placeholder="If other than parents" />
                            </div>
                            <Field label="Guardian's Contact" name="guardian_contact" value={form.guardian_contact} onChange={handleChange} disabled={isLocked} />
                        </div>
                        <hr className="my-3 opacity-10" />
                        <h6 className="fw-bold text-muted small mb-3 text-uppercase ls-wider">Household Info</h6>
                        <div className="row g-3">
                            <Field label="Family Income Bracket" name="family_income_bracket" value={form.family_income_bracket} onChange={handleChange} disabled={isLocked}>
                                <select name="family_income_bracket" className={`form-select rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} value={form.family_income_bracket} onChange={handleChange} disabled={isLocked}>
                                    <option value="">Select Range</option>
                                    <option value="Below 10,000">Below ₱10,000</option>
                                    <option value="10,000 - 20,000">₱10,000 - ₱20,000</option>
                                    <option value="20,000 - 40,000">₱20,000 - ₱40,000</option>
                                    <option value="40,000 - 70,000">₱40,000 - ₱70,000</option>
                                    <option value="70,000 - 100,000">₱70,000 - ₱100,000</option>
                                    <option value="Above 100,000">Above ₱100,000</option>
                                </select>
                            </Field>
                            <Field label="Living Status" name="living_status" value={form.living_status} onChange={handleChange} disabled={isLocked}>
                                <select name="living_status" className={`form-select rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} value={form.living_status} onChange={handleChange} disabled={isLocked}>
                                    <option value="">Select Status</option>
                                    <option value="Living with Parents">Living with Parents</option>
                                    <option value="Living with Guardian">Living with Guardian</option>
                                    <option value="Living with Relatives">Living with Relatives</option>
                                    <option value="Boarding House">Boarding House</option>
                                    <option value="Dormitory">Dormitory</option>
                                    <option value="Own House">Own House</option>
                                </select>
                            </Field>
                        </div>
                    </SectionCard>
                )}

                {/* EDUCATIONAL BACKGROUND */}
                {activeTab === 'education' && (
                    <SectionCard icon="bi-mortarboard-fill" title="Educational Background" badge={isLocked && <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3"><i className="bi bi-lock-fill me-1"></i>Locked</span>}>
                        {/* Elementary */}
                        <div className="p-3 rounded-4 mb-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><i className="bi bi-book text-warning"></i>Elementary School</h6>
                            <div className="row g-3">
                                <Field label="School Name" name="elementary_school" value={form.elementary_school} onChange={handleChange} disabled={isLocked} placeholder="e.g. San Jose Elementary School" />
                                <Field label="Year Graduated" name="elementary_year_graduated" value={form.elementary_year_graduated} onChange={handleChange} disabled={isLocked} placeholder="e.g. 2016" />
                                <div className="col-12">
                                    <label className="form-label small text-muted mb-1 fw-semibold">Awards / Honors Received</label>
                                    <textarea name="elementary_awards" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} rows="2" value={form.elementary_awards} onChange={handleChange} disabled={isLocked} placeholder="e.g. With Honors, Best in Math (separate by comma)"></textarea>
                                </div>
                            </div>
                        </div>
                        {/* Junior High */}
                        <div className="p-3 rounded-4 mb-4" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><i className="bi bi-journal-text text-success"></i>Junior High School</h6>
                            <div className="row g-3">
                                <Field label="School Name" name="junior_high_school" value={form.junior_high_school} onChange={handleChange} disabled={isLocked} placeholder="e.g. City National High School" />
                                <Field label="Year Graduated" name="junior_high_year_graduated" value={form.junior_high_year_graduated} onChange={handleChange} disabled={isLocked} placeholder="e.g. 2020" />
                                <div className="col-12">
                                    <label className="form-label small text-muted mb-1 fw-semibold">Awards / Honors Received</label>
                                    <textarea name="junior_high_awards" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} rows="2" value={form.junior_high_awards} onChange={handleChange} disabled={isLocked} placeholder="e.g. With High Honors, Leadership Award"></textarea>
                                </div>
                            </div>
                        </div>
                        {/* Senior High */}
                        <div className="p-3 rounded-4" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><i className="bi bi-building text-primary"></i>Senior High School</h6>
                            <div className="row g-3">
                                <Field label="School Name" name="senior_high_school" value={form.senior_high_school} onChange={handleChange} disabled={isLocked} placeholder="e.g. Provincial Science High School" />
                                <Field label="Year Graduated" name="senior_high_year_graduated" value={form.senior_high_year_graduated} onChange={handleChange} disabled={isLocked} placeholder="e.g. 2022" />
                                <div className="col-12">
                                    <label className="form-label small text-muted mb-1 fw-semibold">Awards / Honors Received</label>
                                    <textarea name="senior_high_awards" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} rows="2" value={form.senior_high_awards} onChange={handleChange} disabled={isLocked} placeholder="e.g. Valedictorian, STEM Track Award"></textarea>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* SKILLS & TALENTS */}
                {activeTab === 'skills' && (
                    <>
                        <SectionCard icon="bi-lightning-charge-fill" title="Skills" badge={isLocked && <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3"><i className="bi bi-lock-fill me-1"></i>Locked</span>}>
                            <p className="small text-muted mb-3">Check all the skills that you have or are currently developing.</p>
                            {/* Group by skill_type */}
                            {Object.entries(allSkills.reduce((groups, skill) => {
                                const type = skill.skill_type || 'Other';
                                if (!groups[type]) groups[type] = [];
                                groups[type].push(skill);
                                return groups;
                            }, {})).map(([type, skills]) => (
                                <div key={type} className="mb-4">
                                    <h6 className="fw-bold text-muted small text-uppercase mb-2"><i className="bi bi-tag-fill me-1"></i>{type}</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {skills.map(skill => {
                                            const selected = form.skill_ids.includes(skill.skill_id);
                                            return (
                                                <button
                                                    key={skill.skill_id}
                                                    type="button"
                                                    className={`btn btn-sm rounded-pill px-3 py-2 fw-medium border transition-all ${selected ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary'}`}
                                                    onClick={() => toggleSkill(skill.skill_id)}
                                                    disabled={isLocked}
                                                    style={{ transition: 'all 0.2s' }}
                                                >
                                                    {selected && <i className="bi bi-check2 me-1"></i>}
                                                    {skill.skill_name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {allSkills.length === 0 && <p className="text-muted small">No skills available yet.</p>}
                        </SectionCard>

                        <SectionCard icon="bi-star-fill" title="Talents" badge={isLocked && <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3"><i className="bi bi-lock-fill me-1"></i>Locked</span>}>
                            <p className="small text-muted mb-3">Select your talents and special abilities.</p>
                            <div className="d-flex flex-wrap gap-2">
                                {allTalents.map(talent => {
                                    const selected = form.talent_ids.includes(talent.talent_id);
                                    return (
                                        <button
                                            key={talent.talent_id}
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 py-2 fw-medium border transition-all ${selected ? 'text-white shadow-sm' : 'btn-outline-secondary'}`}
                                            style={{
                                                backgroundColor: selected ? '#8b5cf6' : 'transparent',
                                                borderColor: selected ? '#8b5cf6' : undefined,
                                                transition: 'all 0.2s',
                                            }}
                                            onClick={() => toggleTalent(talent.talent_id)}
                                            disabled={isLocked}
                                        >
                                            {selected && <i className="bi bi-check2 me-1"></i>}
                                            {talent.talent_name}
                                        </button>
                                    );
                                })}
                            </div>
                            {allTalents.length === 0 && <p className="text-muted small">No talents available yet.</p>}
                        </SectionCard>
                    </>
                )}

                {/* MEDICAL HISTORY */}
                {activeTab === 'medical' && (
                    <SectionCard icon="bi-heart-pulse-fill" title="Medical History" badge={isLocked && <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3"><i className="bi bi-lock-fill me-1"></i>Locked</span>}>
                        <p className="small text-muted mb-4">Please provide accurate information about your health history. This information is confidential and will only be used by authorized university personnel.</p>
                        
                        <div className="row g-4">
                            <div className="col-md-4">
                                <label className="form-label small text-muted mb-1 fw-semibold">Blood Type</label>
                                <select name="blood_type" className={`form-select rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} value={form.blood_type} onChange={handleChange} disabled={isLocked}>
                                    <option value="">Unknown</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="form-label small text-muted mb-1 fw-semibold">Medical History / Past Conditions</label>
                                <textarea name="medical_history" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} rows="3" value={form.medical_history} onChange={handleChange} disabled={isLocked} placeholder="e.g. Asthma, Hypertension, Diabetes, Past Surgeries..."></textarea>
                            </div>

                            <div className="col-12">
                                <label className="form-label small text-muted mb-1 fw-semibold">Allergies</label>
                                <textarea name="allergies" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} rows="2" value={form.allergies} onChange={handleChange} disabled={isLocked} placeholder="e.g. Food allergies, Drug allergies, Environmental allergies..."></textarea>
                            </div>

                            <div className="col-12">
                                <label className="form-label small text-muted mb-1 fw-semibold">Current Medications</label>
                                <textarea name="medications" className={`form-control rounded-3 py-2 ${isLocked ? 'bg-light' : 'border-primary border-opacity-50'}`} rows="2" value={form.medications} onChange={handleChange} disabled={isLocked} placeholder="List any medications you are currently taking..."></textarea>
                            </div>
                        </div>
                    </SectionCard>
                )}




            </div>

            {/* ── Action Buttons ── */}
            {activeTab !== 'documents' && (
                <div className="card border-0 rounded-4 shadow-sm p-4 mb-5">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                        <div className="small text-muted">
                            {isLocked ? (
                                <><i className="bi bi-info-circle me-1"></i>Your profile is submitted and locked.</>
                            ) : (
                                <><i className="bi bi-info-circle me-1"></i>Save as draft to continue later, or submit to finalize (one-time only).</>
                            )}
                        </div>
                        {!isLocked && (
                            <div className="d-flex gap-2 flex-shrink-0">
                                <button className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold" onClick={handleSaveDraft} disabled={saving}>
                                    {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                                    Save Draft
                                </button>
                                <button className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm" onClick={() => setShowConfirmModal(true)} disabled={submitting}>
                                    <i className="bi bi-send-fill me-2"></i>Submit Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────── Faculty Profile (Simple View) ─────────────────── */
const FacultyProfile = ({ user }) => {
    const [formData, setFormData] = useState({ 
        contact_number: '', 
        address: '',
        nickname: '',
        gender: '',
        birthdate: '',
        civil_status: 'Single',
        nationality: 'Filipino',
        religion: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (user?.faculty) {
            setFormData({
                contact_number: user.faculty.contact_number || '',
                address: user.faculty.address || '',
                nickname: user.faculty.nickname || '',
                gender: user.faculty.gender || '',
                birthdate: user.faculty.birthdate || '',
                civil_status: user.faculty.civil_status || 'Single',
                nationality: user.faculty.nationality || 'Filipino',
                religion: user.faculty.religion || '',
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.put('/profile', formData);
            setMessage('Profile updated successfully!');
        } catch {
            setMessage('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('profile_picture', file);
        setUploadingImage(true);
        try {
            await api.post('/profile/picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage('Profile picture updated!');
            window.location.reload();
        } catch {
            setMessage('Failed to upload picture.');
        } finally {
            setUploadingImage(false);
        }
    };

    const getProfileImageUrl = () => {
        if (!user?.profile_picture) return null;
        if (user.profile_picture.startsWith('http')) return user.profile_picture;
        return `${api.defaults.baseURL.replace('/api', '')}/storage/${user.profile_picture}`;
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card border-0 rounded-4 mb-4 text-white overflow-hidden shadow" style={{ background: 'linear-gradient(135deg, #3b3aee 0%, #6366f1 100%)' }}>
                <div className="p-4 d-flex align-items-center">
                    <div className="position-relative me-4" style={{ width: '90px', height: '90px' }}>
                        {getProfileImageUrl() ? (
                            <img src={getProfileImageUrl()} alt="Profile" className="rounded-circle shadow object-fit-cover w-100 h-100" />
                        ) : (
                            <div className="bg-white bg-opacity-25 text-white fw-bold rounded-circle d-flex align-items-center justify-content-center shadow w-100 h-100 fs-1">{user?.name?.charAt(0).toUpperCase() || 'F'}</div>
                        )}
                        <label className="position-absolute bottom-0 end-0 bg-white text-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', cursor: 'pointer' }}>
                            <i className={uploadingImage ? 'spinner-border spinner-border-sm' : 'bi bi-camera-fill small'}></i>
                            <input type="file" className="d-none" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                    </div>
                    <div>
                        <h3 className="fw-bold mb-1">{user?.name}</h3>
                        <div className="text-white text-opacity-75 mb-2">{user?.email}</div>
                        <span className="badge bg-white bg-opacity-25 text-white rounded-pill px-3 py-1">Faculty</span>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSave} className="card shadow-sm border-0 rounded-4 bg-white p-4">
                {message && <div className={`alert ${message.includes('success') || message.includes('updated') ? 'alert-success' : 'alert-danger'} py-2 mb-3`}>{message}</div>}
                <h6 className="fw-bold mb-3"><i className="bi bi-person me-2"></i>Faculty Information</h6>
                <div className="row g-3 mb-4">
                    <div className="col-md-6"><label className="form-label small text-muted mb-1 fw-semibold">Full Name</label><input className="form-control rounded-3 py-2 bg-light" value={user?.name || ''} readOnly /></div>
                    <div className="col-md-6"><label className="form-label small text-muted mb-1 fw-semibold">Email Address</label><input className="form-control rounded-3 py-2 bg-light" value={user?.email || ''} readOnly /></div>
                    <div className="col-md-6"><label className="form-label small text-muted mb-1 fw-semibold">Nickname</label><input name="nickname" className="form-control rounded-3 py-2 border-primary border-opacity-50" value={formData.nickname} onChange={handleChange} placeholder="Johnny" /></div>
                    
                    <div className="col-md-6">
                        <label className="form-label small text-muted mb-1 fw-semibold">Gender</label>
                        <select name="gender" className="form-select rounded-3 py-2 border-primary border-opacity-50" value={formData.gender} onChange={handleChange}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div className="col-md-6">
                        <label className="form-label small text-muted mb-1 fw-semibold">Birthdate</label>
                        <input name="birthdate" type="date" className="form-control rounded-3 py-2 border-primary border-opacity-50" value={formData.birthdate} onChange={handleChange} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small text-muted mb-1 fw-semibold">Civil Status</label>
                        <select name="civil_status" className="form-select rounded-3 py-2 border-primary border-opacity-50" value={formData.civil_status} onChange={handleChange}>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Divorced">Divorced</option>
                        </select>
                    </div>

                    <div className="col-md-6"><label className="form-label small text-muted mb-1 fw-semibold">Nationality</label><input name="nationality" className="form-control rounded-3 py-2 border-primary border-opacity-50" value={formData.nationality} onChange={handleChange} placeholder="Filipino" /></div>
                    
                    <div className="col-md-6"><label className="form-label small text-muted mb-1 fw-semibold">Religion</label><input name="religion" className="form-control rounded-3 py-2 border-primary border-opacity-50" value={formData.religion} onChange={handleChange} placeholder="e.g. Roman Catholic" /></div>
                    
                    <div className="col-md-6"><label className="form-label small text-muted mb-1 fw-semibold">Contact Number</label><input name="contact_number" className="form-control rounded-3 py-2 border-primary border-opacity-50" value={formData.contact_number} onChange={handleChange} /></div>
                    <div className="col-12"><label className="form-label small text-muted mb-1 fw-semibold">Address</label><input name="address" className="form-control rounded-3 py-2 border-primary border-opacity-50" value={formData.address} onChange={handleChange} /></div>
                </div>
                <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary rounded-pill px-4 py-2 fw-bold" disabled={saving}>
                        {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserProfile;
