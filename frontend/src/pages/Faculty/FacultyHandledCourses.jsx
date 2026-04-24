import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const FacultyHandledCourses = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/faculty/schedules?search=${search}`);
            setSchedules(response.data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchSchedules();
    };

    if (loading && schedules.length === 0) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="display-6 fw-bold mb-0">Handled Courses & Sections</h2>
            </div>

            {/* Filter Section */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <form onSubmit={handleSearch} className="row g-3 align-items-end">
                    <div className="col-md-8">
                        <label className="form-label small text-muted fw-bold">Search Courses / Sections</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-pill"><i className="bi bi-search"></i></span>
                            <input 
                                type="text" 
                                className="form-control bg-light border-start-0 rounded-end-pill py-2" 
                                placeholder="Search by subject code, title, or section name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm">
                            Apply Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Schedules Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="px-4 py-3">Subject & Code</th>
                                <th className="py-3 text-center">Section</th>
                                <th className="py-3">Schedule</th>
                                <th className="py-3">Room</th>
                                <th className="px-4 py-3 text-end">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.length > 0 ? (
                                schedules.map((item) => (
                                    <tr key={item.schedule_id} className="transition-all">
                                        <td className="px-4 py-3">
                                            <div className="fw-bold text-dark">{item.title}</div>
                                            <div className="small text-muted">{item.subject_code}</div>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 fw-bold">
                                                {item.section}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-calendar3 text-primary"></i>
                                                <span className="small fw-medium">{item.days_of_week}</span>
                                            </div>
                                            <div className="small text-muted">
                                                {item.start_time} - {item.end_time}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="small">
                                                <i className="bi bi-geo-alt me-1 text-danger"></i>
                                                {item.room_assignment || 'TBA'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">
                                                Ongoing
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-calendar-x display-4 d-block mb-3 opacity-25"></i>
                                        No courses found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultyHandledCourses;
