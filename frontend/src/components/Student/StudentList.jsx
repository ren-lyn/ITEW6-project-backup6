import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useLocation } from 'react-router-dom';
import StudentForm from './StudentForm';
import StudentDetail from './StudentDetail';

const StudentList = () => {
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [showForm, setShowForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);

    const [filters, setFilters] = useState({
        search: new URLSearchParams(location.search).get('search') || '',
        course: '',
        year_level: '',
        skill: '',
        affiliation: ''
    });

    const fetchStudents = async (page = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({ ...filters, page }).toString();
            const response = await api.get(`/students?${queryParams}`);
            
            // Handle Laravel Pagination Structure
            const paginationData = response.data;
            if (paginationData && paginationData.data) {
                setStudents(paginationData.data);
                setTotalPages(paginationData.last_page);
                setCurrentPage(paginationData.current_page);
                setTotalStudents(paginationData.total);
            } else {
                setStudents(Array.isArray(paginationData) ? paginationData : []);
                setTotalPages(1);
                setTotalStudents(Array.isArray(paginationData) ? paginationData.length : 0);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents(1);
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchStudents(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchStudents(newPage);
            window.scrollTo(0, 0);
        }
    };

    const handleArchive = async (userId) => {
        if (!userId) return;
        if (!window.confirm('Are you sure you want to archive this user profile?')) return;

        try {
            await api.post(`/admin/users/${userId}/archive`);
            alert('User archived successfully');
            fetchStudents(currentPage);
        } catch (error) {
            console.error('Error archiving user:', error);
            alert(error.response?.data?.message || 'Error archiving user.');
        }
    };

    const handleEdit = (e, student) => {
        e.stopPropagation();
        setStudentToEdit(student);
        setShowForm(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to remove this student record?')) {
            try {
                await api.delete(`/students/${id}`);
                fetchStudents(currentPage);
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Failed to delete student.');
            }
        }
    };

    if (showForm) {
        return <StudentForm student={studentToEdit} onSave={() => { setShowForm(false); setStudentToEdit(null); fetchStudents(currentPage); }} onCancel={() => { setShowForm(false); setStudentToEdit(null); }} />;
    }

    if (selectedStudent) {
        return <StudentDetail studentId={selectedStudent.student_id} onBack={() => setSelectedStudent(null)} />;
    }

    return (
        <div className="animate-slide-up">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
                <div>
                    <h2 className="display-6 fw-bold mb-1 text-dark">Student Profiling</h2>
                    <p className="text-muted mb-0">Manage {totalStudents} comprehensive student records</p>
                </div>
                <div className="d-flex gap-2">
                    <div className="btn-group shadow-sm rounded-pill overflow-hidden" style={{ border: '1px solid #dee2e6' }}>
                        <button 
                            className={`btn btn-sm ${viewMode === 'table' ? 'btn-dark' : 'btn-light border-0'}`} 
                            onClick={() => setViewMode('table')}
                            title="Table View"
                        >
                            <i className="bi bi-table"></i>
                        </button>
                        <button 
                            className={`btn btn-sm ${viewMode === 'card' ? 'btn-dark' : 'btn-light border-0'}`} 
                            onClick={() => setViewMode('card')}
                            title="Card View"
                        >
                            <i className="bi bi-grid-3x3-gap"></i>
                        </button>
                    </div>
                    <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold text-white" style={{ backgroundColor: '#f37021', borderColor: '#f37021' }} onClick={() => setShowForm(true)}>
                        <i className="bi bi-plus-lg me-2"></i> Add Student
                    </button>
                </div>
            </div>

            <div className="card mb-5 border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white py-3 border-bottom border-light">
                    <h5 className="mb-0 fw-bold small text-uppercase tracking-wider">Search & Filters</h5>
                </div>
                <div className="card-body p-4 bg-light bg-opacity-50">
                    <form onSubmit={handleFilterSubmit} className="row g-3">
                        <div className="col-md-3">
                            <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-white border-0"><i className="bi bi-search text-muted"></i></span>
                                <input
                                    type="text"
                                    name="search"
                                    className="form-control border-0 focus-ring-none"
                                    placeholder="Name or ID..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <select name="course" className="form-select border-0 shadow-sm rounded-3" value={filters.course} onChange={handleFilterChange}>
                                <option value="">All Courses</option>
                                <option value="BSCS">BSCS</option>
                                <option value="BSIT">BSIT</option>
                                <option value="BSIS">BSIS</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <input
                                type="text"
                                name="skill"
                                className="form-control border-0 shadow-sm rounded-3"
                                placeholder="Skill (e.g. Programming)"
                                value={filters.skill}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="text"
                                name="affiliation"
                                className="form-control border-0 shadow-sm rounded-3"
                                placeholder="Affiliation (Org/Sport)"
                                value={filters.affiliation}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-dark w-100 rounded-3 shadow-none fw-bold" style={{ backgroundColor: '#212121' }}>Query</button>
                        </div>
                    </form>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {viewMode === 'table' ? (
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr className="text-secondary small text-uppercase fw-bold">
                                            <th className="ps-4">Student ID</th>
                                            <th>Full Name</th>
                                            <th>Program</th>
                                            <th>Level</th>
                                            <th>Skills</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => {
                                            const profile_picture = student.user?.profile_picture;
                                            const imgUrl = profile_picture ? (profile_picture.startsWith('http') ? profile_picture : `http://localhost:8000/storage/${profile_picture}`) : null;
                                            
                                            // Determine latest academic record
                                            const academicRecords = student.academic_records || student.academicRecords || [];
                                            const latestRecord = [...academicRecords].sort((a, b) => {
                                                if (parseInt(b.year_level) !== parseInt(a.year_level)) {
                                                    return parseInt(b.year_level) - parseInt(a.year_level);
                                                }
                                                const getSemValue = (s) => {
                                                    if (!s) return 0;
                                                    if (typeof s === 'string' && s.includes('1st')) return 1;
                                                    if (typeof s === 'string' && s.includes('2nd')) return 2;
                                                    return parseInt(s) || 0;
                                                };
                                                return getSemValue(b.semester) - getSemValue(a.semester);
                                            })[0] || {};

                                            return (
                                                <tr key={student.student_id} onClick={() => setSelectedStudent(student)} className="cursor-pointer">
                                                    <td className="ps-4 fw-bold text-primary">{student.id_number || student.student_id}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            {imgUrl ? (
                                                                <img src={imgUrl} alt="Avatar" className="rounded-circle me-3 object-fit-cover shadow-sm" style={{ width: '40px', height: '40px', minWidth: '40px' }} />
                                                            ) : (
                                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="fw-bold text-dark">{(student.first_name || '') + ' ' + (student.last_name || '')}</div>
                                                                <div className="small font-monospace text-muted">{student.email || student.user?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="badge bg-primary bg-opacity-25 text-dark rounded-pill px-3 py-1 border border-primary border-opacity-10">{latestRecord.course || 'N/A'}</span></td>
                                                    <td><div className="text-center bg-light rounded-pill px-2 py-1 small fw-bold">{latestRecord.year_level || 'N/A'}</div></td>
                                                    <td>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {student.skills?.slice(0, 2).map(s => (
                                                                <span key={s.skill_id || s.id} className="badge bg-dark text-white fw-normal rounded-pill px-2" style={{ fontSize: '0.65rem' }}>{s.skill_name}</span>
                                                            ))}
                                                            {student.skills?.length > 2 && <span className="small text-muted" style={{ fontSize: '0.65rem' }}>+{student.skills.length - 2}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <div className="btn-group btn-group-sm bg-white rounded-pill shadow-sm border overflow-hidden">
                                                            <button className="btn btn-white border-0 py-1" onClick={(e) => handleEdit(e, student)} title="Edit"><i className="bi bi-pencil-square text-primary"></i></button>
                                                            <button className="btn btn-white border-0 py-1" onClick={(e) => { e.stopPropagation(); handleArchive(student.user_id || student.user?.id); }} title="Archive"><i className="bi bi-archive text-warning" style={{ color: '#f37021' }}></i></button>
                                                            <button className="btn btn-danger-soft border-0 py-1" onClick={(e) => handleDelete(e, student.student_id)} title="Delete"><i className="bi bi-trash text-danger"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {students.length === 0 && (
                                <div className="text-center py-5 bg-white">
                                    <i className="bi bi-person-x fs-1 text-muted opacity-50 mb-3 d-block"></i>
                                    <p className="text-muted fs-5">No students found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="row g-4 mb-4">
                            {students.map((student) => {
                                const profile_picture = student.user?.profile_picture;
                                const imgUrl = profile_picture ? (profile_picture.startsWith('http') ? profile_picture : `http://localhost:8000/storage/${profile_picture}`) : null;
                                
                                // Determine latest academic record
                                const academicRecords = student.academic_records || student.academicRecords || [];
                                const latestRecord = [...academicRecords].sort((a, b) => {
                                    if (parseInt(b.year_level) !== parseInt(a.year_level)) {
                                        return parseInt(b.year_level) - parseInt(a.year_level);
                                    }
                                    const getSemValue = (s) => {
                                        if (!s) return 0;
                                        if (typeof s === 'string' && s.includes('1st')) return 1;
                                        if (typeof s === 'string' && s.includes('2nd')) return 2;
                                        return parseInt(s) || 0;
                                    };
                                    return getSemValue(b.semester) - getSemValue(a.semester);
                                })[0] || {};

                                return (
                                    <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={student.student_id}>
                                        <div 
                                            className="card border-0 shadow-sm rounded-4 h-100 p-4 hover-lift cursor-pointer position-relative d-flex flex-column" 
                                            onClick={() => setSelectedStudent(student)}
                                            style={{ transition: 'all 0.3s ease' }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                {imgUrl ? (
                                                    <img src={imgUrl} alt="Student" className="rounded-circle shadow-sm object-fit-cover" style={{ width: '56px', height: '56px' }} />
                                                ) : (
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: '56px', height: '56px' }}>
                                                        {student.first_name?.[0]}{student.last_name?.[0]}
                                                    </div>
                                                )}
                                                <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                                                    <button className="btn btn-sm btn-light rounded-circle shadow-none" title="Edit" onClick={(e) => handleEdit(e, student)}><i className="bi bi-pencil-square text-primary"></i></button>
                                                    <button className="btn btn-sm btn-light rounded-circle shadow-none" title="Archive" onClick={(e) => { e.stopPropagation(); handleArchive(student.user_id || student.user?.id); }}><i className="bi bi-archive text-warning" style={{ color: '#f37021' }}></i></button>
                                                    <button className="btn btn-sm btn-light rounded-circle shadow-none" title="Delete" onClick={(e) => handleDelete(e, student.student_id)}><i className="bi bi-trash text-danger"></i></button>
                                                </div>
                                            </div>
                                        
                                        <h5 className="fw-bold mb-1 text-dark">{student.first_name} {student.last_name}</h5>
                                        <p className="small text-muted mb-3 font-monospace">ID: {student.id_number || student.student_id}</p>
                                        
                                        <div className="bg-light bg-opacity-50 rounded-4 p-3 mb-3 border border-white">
                                            <div className="d-flex justify-content-between mb-2 small shadow-sm bg-white p-2 rounded-3">
                                                <span className="text-muted">GWA</span>
                                                <span className="fw-bold text-primary">{latestRecord.gwa || 'N/A'}</span>
                                            </div>
                                            <div className="d-flex flex-wrap gap-1 mt-3">
                                                {student.skills?.slice(0, 2).map((s, i) => (
                                                    <span key={s.skill_id || i} className="badge bg-dark rounded-pill px-2 fw-normal" style={{ fontSize: '0.6rem' }}>{s.skill_name}</span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
                                            <span className="badge bg-primary bg-opacity-25 text-dark rounded-pill px-2 py-1 small">
                                                {latestRecord.course || 'CCS'}
                                            </span>
                                            <span className="small text-muted">Year {latestRecord.year_level || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                            {students.length === 0 && (
                                <div className="col-12 text-center py-5">
                                     <i className="bi bi-person-x fs-1 text-muted opacity-50 mb-3 d-block"></i>
                                    <p className="text-muted fs-5">No students found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded-4 shadow-sm border border-light">
                            <div className="small text-muted">
                                Showing <span className="fw-bold">{(currentPage - 1) * 24 + 1}</span> to <span className="fw-bold">{Math.min(currentPage * 24, totalStudents)}</span> of <span className="fw-bold">{totalStudents}</span> students
                            </div>
                            <nav aria-label="Page navigation">
                                <ul className="pagination pagination-sm mb-0 gap-1">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-circle border-0 shadow-none" onClick={() => handlePageChange(currentPage - 1)}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        let pageNum = currentPage;
                                        if (currentPage <= 3) pageNum = i + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = currentPage - 2 + i;
                                        
                                        if (pageNum < 1 || pageNum > totalPages) return null;

                                        return (
                                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                <button 
                                                    className={`page-link rounded-circle border-0 shadow-none px-3 ${currentPage === pageNum ? 'bg-primary text-white' : 'bg-light text-dark'}`} 
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            </li>
                                        );
                                    })}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-circle border-0 shadow-none" onClick={() => handlePageChange(currentPage + 1)}>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentList;
