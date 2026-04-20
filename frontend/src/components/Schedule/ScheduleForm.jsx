import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ScheduleForm = ({ schedule, onSave, onCancel }) => {
    const [formData, setFormData] = useState(schedule ? { ...schedule } : {
        schedule_type: 'Class',
        title: '',
        subject_code: '',
        section: '',
        year_level: '1',
        faculty_id: '',
        event_id: '',
        days_of_week: 'Monday',
        start_time: '',
        end_time: '',
        room_assignment: ''
    });

    const [faculty, setFaculty] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [facRes, evRes] = await Promise.all([
                    api.get('/faculty'),
                    api.get('/events')
                ]);
                setFaculty(facRes.data.data || facRes.data);
                setEvents(evRes.data.data || evRes.data);
            } catch (error) {
                console.error("Error fetching lookups:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (schedule && schedule.schedule_id) {
                await api.put(`/schedules/${schedule.schedule_id}`, formData);
            } else {
                await api.post('/schedules', formData);
            }
            if (onSave) onSave();
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("Failed to save schedule.");
        }
    };

    return (
        <>
            {/* Modal Backdrop overlay effect */}
            <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}></div>

            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }} aria-hidden="true" role="dialog">
                <div className="modal-dialog modal-dialog-centered modal-lg border-0 shadow-lg" style={{ maxWidth: '700px' }}>
                    <div className="modal-content rounded-4 overflow-hidden border-0 shadow" style={{ backgroundColor: '#ecdabd' }}>

                        <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="modal-title fw-bold text-dark fs-4" style={{ letterSpacing: '0.5px' }}>ASSIGN FACULTY TO SECTION</h5>
                            <button type="button" className="btn-close shadow-none" onClick={onCancel} style={{ filter: 'opacity(0.5)' }}></button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body p-4 pt-3 pb-5">
                            <div className="row g-3">
                                
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#444' }}>Subject / Course</label>
                                    <div className="d-flex align-items-center form-control border-0 rounded-3 shadow-none bg-light ps-0 pe-2 py-0">
                                        <select name="subject_code" className="form-select border-0 shadow-none bg-transparent py-2 w-100" value={formData.subject_code || ''} onChange={handleChange} required>
                                            <option value="">Select Course</option>
                                            {/* 1st Year */}
                                            <option value="CCS101">CCS101 - Intro to Computing</option>
                                            <option value="CCS102">CCS102 - Comp Prog 1</option>
                                            <option value="CCS103">CCS103 - Comp Prog 2</option>
                                            <option value="CCS114">CCS114 - Web Tech</option>
                                            {/* 2nd Year */}
                                            <option value="CCS105">CCS105 - HCI 1</option>
                                            <option value="CCS107">CCS107 - DSA</option>
                                            <option value="ITEW1">ITEW1 - Responsive Web Design</option>
                                            <option value="CCS108">CCS108 - OOP</option>
                                            {/* 3rd Year */}
                                            <option value="CCS109">CCS109 - SAD</option>
                                            <option value="ITEW3">ITEW3 - Mobile Prog 1</option>
                                            <option value="ITP108">ITP108 - Capstone 1</option>
                                            {/* 4th Year */}
                                            <option value="ITP112">ITP112 - Capstone 2</option>
                                            <option value="ITP113">ITP113 - IT Practicum</option>
                                        </select>
                                    </div>
                                    <input type="text" name="title" className="form-control form-control-sm border-0 bg-transparent shadow-none px-2 mt-1 small" placeholder="Course Title (Optional)" value={formData.title || ''} onChange={handleChange} />
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#444' }}>Section Name</label>
                                    <div className="d-flex align-items-center form-control border-0 rounded-3 shadow-none bg-light ps-0 pe-2 py-0">
                                        <select name="section" className="form-select border-0 shadow-none bg-transparent py-2 w-100" value={formData.section || ''} onChange={handleChange}>
                                            <option value="">Select Section</option>
                                            <option value="IT1A">IT1A</option>
                                            <option value="IT1B">IT1B</option>
                                            <option value="CS1A">CS1A</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-12 mt-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#444' }}>Assigned Faculty</label>
                                    <div className="d-flex align-items-center form-control border-0 rounded-3 shadow-none bg-light ps-0 pe-2 py-0">
                                        <select name="faculty_id" className="form-select border-0 shadow-none bg-transparent py-2 w-100 text-muted" value={formData.faculty_id || ''} onChange={handleChange}>
                                            <option value="">Select Professor</option>
                                            {faculty.map((f) => (
                                                <option key={f.faculty_id} value={f.faculty_id}>
                                                    {f.user?.first_name} {f.user?.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-6 mt-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#444' }}>Day</label>
                                    <div className="d-flex align-items-center form-control border-0 rounded-3 shadow-none bg-light ps-0 pe-2 py-0">
                                        <select name="days_of_week" className="form-select border-0 shadow-none bg-transparent py-2 w-100 text-muted" value={formData.days_of_week || ''} onChange={handleChange} required>
                                            <option value="">Select Day</option>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                            <option value="Saturday">Saturday</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6 mt-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#444' }}>Schedule Type</label>
                                    <div className="d-flex align-items-center form-control border-0 rounded-3 shadow-none bg-light ps-0 pe-2 py-0">
                                        <select name="schedule_type" className="form-select border-0 shadow-none bg-transparent py-2 w-100 text-muted" value={formData.schedule_type} onChange={handleChange}>
                                            <option value="Class">Lecture</option>
                                            <option value="Laboratory">Laboratory</option>
                                            <option value="Event">Event</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-4 mt-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#444' }}>Start Time</label>
                                    <div className="form-control border-0 rounded-3 shadow-none bg-light px-2 py-0">
                                        <input type="time" name="start_time" className="form-control border-0 bg-transparent shadow-none py-2 px-1 text-muted text-center" value={formData.start_time || ''} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-md-4 mt-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#444' }}>End Time</label>
                                    <div className="form-control border-0 rounded-3 shadow-none bg-light px-2 py-0">
                                        <input type="time" name="end_time" className="form-control border-0 bg-transparent shadow-none py-2 px-1 text-muted text-center" value={formData.end_time || ''} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-md-4 mt-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px', color: '#444' }}>Room</label>
                                    <div className="form-control border-0 rounded-3 shadow-none bg-light pe-2 ps-3 py-0">
                                        <input type="text" name="room_assignment" className="form-control border-0 bg-transparent shadow-none py-2 px-0 text-muted" placeholder="Comp Lab 1" value={formData.room_assignment || ''} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 mb-2">
                                <button type="submit" className="btn w-100 rounded-3 py-3 fw-bold text-white fs-6 shadow-sm" style={{ backgroundColor: '#e94b15', letterSpacing: '2px', border: 'none' }}>
                                    GENERATE SCHEDULE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ScheduleForm;
