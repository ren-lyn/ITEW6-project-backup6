import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ScheduleForm from './ScheduleForm';

const ScheduleList = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState(null);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await api.get('/schedules');
            const data = response.data.data || response.data;
            setSchedules(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching schedules:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this scheduling block?")) return;
        try {
            await api.delete(`/schedules/${id}`);
            fetchSchedules();
        } catch (error) {
            console.error("Error deleting schedule:", error);
            alert("Failed to delete schedule block.");
        }
    };

    const handleEdit = (schedule) => {
        setScheduleToEdit(schedule);
        setShowForm(true);
    };



    return (
        <div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom">
                <div>
                    <h2 className="display-4 fw-bold mb-2 text-dark d-flex align-items-center">
                        <i className="bi bi-calendar-range text-primary me-3"></i> Master Schedule
                    </h2>
                    <p className="text-secondary lead mb-0">Venue, academic class, and departmental event management matrix.</p>
                </div>
                <button className="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-bold shadow-sm mt-4 mt-md-0 d-flex align-items-center" onClick={() => setShowForm(true)}>
                    <i className="bi bi-plus-lg me-2 fs-5"></i> Create Schedule
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5 my-5">
                    <div className="spinner-grow text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-3 text-muted fw-bold tracking-wider">Syncing scheduling matrix...</p>
                </div>
            ) : schedules.length === 0 ? (
                <div className="text-center py-5 my-5">
                    <div className="card border-0 shadow-sm rounded-4 p-5 bg-white mx-auto" style={{ maxWidth: '600px' }}>
                        <i className="bi bi-calendar-x display-1 opacity-25 text-primary mb-4"></i>
                        <h3 className="text-dark fw-bold mb-3">No active schedules</h3>
                        <p className="text-muted lead pb-3">
                            The scheduling database is currently devoid of records. Start by creating academic classes mapping structures, or logging departmental events to allocate your resources effectively.
                        </p>
                        <div className="mt-2">
                            <button className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm" onClick={() => setShowForm(true)}>
                                Create First Schedule Block
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {schedules.map((schedule) => {
                        const isClass = schedule.schedule_type === 'Class';
                        const isEvent = schedule.schedule_type === 'Event';
                        
                        // Badge Styling Map
                        const themeClass = isClass ? 'primary' : (isEvent ? 'warning' : 'info');
                        const iconClass = isClass ? 'bi-journals' : (isEvent ? 'bi-calendar-star' : 'bi-collection');

                        return (
                            <div className="col-md-6 col-xl-4" key={schedule.schedule_id}>
                                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column" style={{ transition: 'all 0.2s' }}>
                                    <div className={`p-3 d-flex justify-content-between align-items-center bg-${themeClass} bg-opacity-10 border-bottom border-${themeClass} border-opacity-25`}>
                                        <div className="d-flex align-items-center gap-2">
                                            <i className={`bi ${iconClass} text-${themeClass} fs-5`}></i>
                                            <span className={`badge bg-${themeClass} ${isEvent ? 'text-dark' : ''} rounded-pill px-3 shadow-sm text-uppercase tracking-wider`} style={{ fontSize: '0.65rem' }}>
                                                {schedule.schedule_type}
                                            </span>
                                        </div>
                                        <div className={`fw-bold small text-${themeClass}`} style={{ letterSpacing: '1px' }}>
                                            {schedule.days_of_week}
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 flex-grow-1 d-flex flex-column">
                                        <h5 className="fw-bold mb-2 text-dark" style={{ lineHeight: '1.4' }}>
                                            {schedule.title || schedule.subject_code || 'Unnamed Block'}
                                        </h5>
                                        
                                        {isClass && schedule.section && (
                                            <div className="text-secondary small fw-bold mb-4">
                                                <span className="badge bg-light text-dark border me-2">Section {schedule.section}</span> 
                                                <span className="badge bg-light text-dark border">Year {schedule.year_level}</span>
                                            </div>
                                        )}
                                        {isEvent && schedule.event && (
                                            <div className="text-secondary small fw-bold mb-4">
                                                Mapped to Base Event ID: {schedule.event.event_code || schedule.event.event_id}
                                            </div>
                                        )}

                                        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3 border">
                                            <div className="d-flex align-items-center text-dark small fw-bold">
                                                <i className="bi bi-clock me-2 text-muted"></i> 
                                                {(schedule.start_time || '').substring(0,5)} - {(schedule.end_time || '').substring(0,5)}
                                            </div>
                                            <div className="d-flex align-items-center text-dark small fw-bold ms-auto">
                                                <i className="bi bi-geo-alt me-2 text-danger"></i> 
                                                {schedule.room_assignment || 'TBA'}
                                            </div>
                                        </div>

                                        {isClass && schedule.faculty && (
                                            <div className="mb-4 d-flex align-items-center bg-white border p-3 rounded-4 shadow-sm mt-auto">
                                                <div className={`bg-${themeClass} text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm`} style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                                                    {schedule.faculty.user?.first_name?.charAt(0) || 'F'}{schedule.faculty.user?.last_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                                        {schedule.faculty.user?.first_name} {schedule.faculty.user?.last_name}
                                                    </div>
                                                    <div className="text-muted text-uppercase tracking-wider mt-1" style={{ fontSize: '0.65rem' }}>
                                                        <i className="bi bi-bezier2 me-1"></i> {schedule.faculty.department || 'Faculty Instructor'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                            <button className="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => handleEdit(schedule)}>
                                                <i className="bi bi-pencil-square me-2"></i> Modify
                                            </button>
                                            <button className="btn btn-sm btn-light text-danger rounded-circle p-2 shadow-sm border border-danger border-opacity-10" onClick={() => handleDelete(schedule.schedule_id)} title="Delete Schedule">
                                                <i className="bi bi-trash text-danger"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <ScheduleForm 
                    schedule={scheduleToEdit} 
                    onSave={() => { setShowForm(false); setScheduleToEdit(null); fetchSchedules(); }} 
                    onCancel={() => { setShowForm(false); setScheduleToEdit(null); }} 
                />
            )}
        </div>
    );
};

export default ScheduleList;
