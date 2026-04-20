import React, { useState } from 'react';
import api from '../../api/axios';

const StudentForm = ({ onSave, onCancel, student = null }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState(student ? {
        ...student,
        course: student.academic_records?.[0]?.course || 'BSIT',
        year_level: student.academic_records?.[0]?.year_level || '1',
        academic_standing: student.academic_records?.[0]?.academic_standing || 'Regular',
    } : {
        first_name: '',
        last_name: '',
        nickname: '',
        student_id: '',
        gender: 'Male',
        birthdate: '',
        civil_status: 'Single',
        nationality: 'Filipino',
        religion: '',
        present_address: '',
        permanent_address: '',
        contact_number: '',
        email: '',

        // Family Info
        father_name: '',
        mother_name: '',
        guardian_contact: '',

        // Academic
        course: 'BSIT',
        year_level: '1',
        academic_standing: 'Regular',
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation to prevent null email/ID errors
        if (!formData.email || !formData.first_name || !formData.last_name || !formData.student_id) {
            alert('Required Information Missing: Please ensure First Name, Last Name, Student ID, and Email Address are filled in the Personal tab.');
            setActiveTab('personal');
            return;
        }

        try {
            if (student) {
                await api.put(`/students/${student.student_id}`, formData);
            } else {
                await api.post('/students', formData);
            }
            if (onSave) onSave();
        } catch (error) {
            console.error('Error saving student:', error);
            const errorMessage = error.response?.data?.message || 'Error saving student profile.';
            alert(errorMessage);
        }
    };

    const tabs = [
        { id: 'personal', label: '1. Personal' },
        { id: 'academic', label: '2. Academic' },
    ];

    return (
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate-slide-up">
            <div className="bg-dark p-4 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #f37021 0%, #212121 100%)' }}>
                <div>
                    <h4 className="fw-bold mb-0 text-white">{student ? 'Update Intel Profile' : 'New Student Registration'}</h4>
                    <p className="small mb-0 opacity-75 text-white">Comprehensive Student Profiling - CCS Intelligence System</p>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
            </div>

            <div className="card-header bg-white border-bottom border-light pt-3 pb-3">
                <ul className="nav nav-pills border-0 px-3 gap-2">
                    {tabs.map(tab => (
                        <li className="nav-item" key={tab.id}>
                            <button
                                className={`nav-link rounded-pill fw-bold small py-2 px-4 border-0 transition-all ${activeTab === tab.id ? 'active shadow icon-glow' : 'text-secondary'}`}
                                style={activeTab === tab.id ? { backgroundColor: '#f37021', color: '#ffffff' } : { backgroundColor: '#f0f2f5', color: '#4a5568' }}
                                onClick={() => setActiveTab(tab.id)}
                                type="button"
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white">
                {activeTab === 'personal' && (
                    <div className="row g-3">
                        <div className="col-md-6"><label className="form-label small fw-bold text-dark">First Name</label><input type="text" name="first_name" className="form-control rounded-3 bg-light border-0" value={formData.first_name} onChange={handleInputChange} required /></div>
                        <div className="col-md-6"><label className="form-label small fw-bold text-dark">Last Name</label><input type="text" name="last_name" className="form-control rounded-3 bg-light border-0" value={formData.last_name} onChange={handleInputChange} required /></div>
                        <div className="col-md-6"><label className="form-label small fw-bold text-dark">Student ID</label><input type="text" name="student_id" className="form-control rounded-3 bg-light border-0" placeholder="CCS-20XX-XXXX" value={formData.student_id} onChange={handleInputChange} required /></div>
                        <div className="col-md-6"><label className="form-label small fw-bold text-dark">Email Address</label><input type="email" name="email" className="form-control rounded-3 bg-light border-0" value={formData.email} onChange={handleInputChange} required /></div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-dark">Gender</label>
                            <select name="gender" className="form-select rounded-3 bg-light border-0" value={formData.gender} onChange={handleInputChange}>
                                <option value="Male">Male</option><option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="col-md-4"><label className="form-label small fw-bold text-dark">Birthdate</label><input type="date" name="birthdate" className="form-control rounded-3 bg-light border-0" value={formData.birthdate} onChange={handleInputChange} required /></div>
                        <div className="col-md-4"><label className="form-label small fw-bold text-dark">Contact Number</label><input type="text" name="contact_number" className="form-control rounded-3 bg-light border-0" value={formData.contact_number} onChange={handleInputChange} required /></div>
                        <div className="col-12"><label className="form-label small fw-bold text-dark">Present Address</label><textarea name="present_address" className="form-control rounded-3 bg-light border-0" rows="2" value={formData.present_address} onChange={handleInputChange} required></textarea></div>
                    </div>
                )}

                {activeTab === 'academic' && (
                    <div className="row g-3">
                        <div className="col-md-6"><label className="form-label small fw-bold text-dark">Course / Program</label><select name="course" className="form-select rounded-3 bg-light border-0" value={formData.course} onChange={handleInputChange}><option value="BSCS">BSCS</option><option value="BSIT">BSIT</option><option value="BSIS">BSIS</option></select></div>
                        <div className="col-md-6"><label className="form-label small fw-bold text-dark">Year Level</label><select name="year_level" className="form-select rounded-3 bg-light border-0" value={formData.year_level} onChange={handleInputChange}><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option></select></div>
                        <div className="col-md-6"><label className="form-label small fw-bold text-dark">Academic Standing</label><select name="academic_standing" className="form-select rounded-3 bg-light border-0" value={formData.academic_standing} onChange={handleInputChange}><option value="Regular">Regular</option><option value="Irregular">Irregular</option></select></div>
                    </div>
                )}



                <div className="d-flex justify-content-end mt-5 pt-4 border-top gap-3">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-5 fw-bold" style={{ backgroundColor: '#ffffff', color: '#4a5568', borderColor: '#cbd5e0' }} onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm text-white" style={{ backgroundColor: '#f37021', borderColor: '#f37021' }}>{student ? 'Update Profile' : 'Save New Student'}</button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
