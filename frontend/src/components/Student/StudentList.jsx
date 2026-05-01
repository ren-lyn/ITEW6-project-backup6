import React, { useState, useEffect } from 'react';
import api, { STORAGE_URL } from '../../api/axios';
import { useLocation } from 'react-router-dom';
import StudentForm from './StudentForm';
import StudentDetail from './StudentDetail';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const StudentList = () => {
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);
    const [viewMode, setViewMode] = useState('card'); // 'table' or 'card'
    const [showForm, setShowForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setViewMode('card');
        };
        window.addEventListener('resize', handleResize);
        // Initial check
        if (window.innerWidth < 768) setViewMode('card');
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [allSkills, setAllSkills] = useState([]);
    const [allTalents, setAllTalents] = useState([]);

    const [filters, setFilters] = useState({
        search: new URLSearchParams(location.search).get('search') || '',
        course: '',
        year_level: '',
        min_gwa: '',
        max_gwa: '',
        skills: [],
        talents: []
    });

    const fetchStudents = async (page = 1) => {
        setLoading(true);
        try {
            let params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (key === 'skills' || key === 'talents') {
                    value.forEach(v => params.append(`${key}[]`, v));
                } else if (value !== '') {
                    params.append(key, value);
                }
            });
            params.append('page', page);

            const response = await api.get(`/students?${params.toString()}`);

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

    const fetchCategories = async () => {
        try {
            const res = await api.get('/skills-talents');
            setAllSkills(res.data.skills || []);
            setAllTalents(res.data.talents || []);
        } catch (err) {
            console.error('Failed to fetch skills/talents', err);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchStudents(1);
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSkillToggle = (skillName) => {
        setFilters(prev => ({
            ...prev,
            skills: prev.skills.includes(skillName)
                ? prev.skills.filter(s => s !== skillName)
                : [...prev.skills, skillName]
        }));
    };

    const handleTalentToggle = (talentName) => {
        setFilters(prev => ({
            ...prev,
            talents: prev.talents.includes(talentName)
                ? prev.talents.filter(t => t !== talentName)
                : [...prev.talents, talentName]
        }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchStudents(1);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            course: '',
            year_level: '',
            min_gwa: '',
            max_gwa: '',
            skills: [],
            talents: []
        });
        setTimeout(() => fetchStudents(1), 0);
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

    const fetchExportData = async () => {
        let params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'skills' || key === 'talents') {
                value.forEach(v => params.append(`${key}[]`, v));
            } else if (value !== '') {
                params.append(key, value);
            }
        });
        params.append('export', 'true');

        const res = await api.get(`/students?${params.toString()}`);
        return Array.isArray(res.data) ? res.data : (res.data.data || []);
    };

    const getReportTitle = () => {
        let activeFilters = [];
        if (filters.search) activeFilters.push(`"${filters.search}"`);
        if (filters.course) activeFilters.push(filters.course);
        if (filters.year_level) activeFilters.push(`Year ${filters.year_level}`);
        if (filters.min_gwa || filters.max_gwa) activeFilters.push(`GWA ${filters.min_gwa || 'Any'}-${filters.max_gwa || 'Any'}`);
        if (filters.skills?.length > 0) activeFilters.push(...filters.skills);
        if (filters.talents?.length > 0) activeFilters.push(...filters.talents);
        
        if (activeFilters.length === 0) {
            return 'Student Report: All Students';
        }

        return `Student Report: This is the results of filtered words search: ${activeFilters.join(', ')}`;
    };

    const handleExportCSV = async () => {
        setExportLoading(true);
        try {
            const dataToExport = await fetchExportData();
            const exportData = dataToExport.map(s => {
                const latestRecord = (s.academicRecords || s.academic_records || [])[0] || {};
                const skills = s.skills?.map(sk => sk.skill_name) || [];
                const talents = s.talents?.map(t => t.talent_name) || [];
                const allAptitudes = [...skills, ...talents].join(', ');

                return {
                    'Student ID': s.id_number || s.student_id,
                    'First Name': s.first_name,
                    'Last Name': s.last_name,
                    'Email': s.email || s.user?.email,
                    'Program': latestRecord.course || 'N/A',
                    'Year Level': latestRecord.year_level || 'N/A',
                    'GWA': latestRecord.gwa || 'N/A',
                    'Skills & Talents': allAptitudes || 'None'
                };
            });
            let csv = Papa.unparse(exportData);
            const titleRow = `"${getReportTitle()}"\n\n`;
            csv = titleRow + csv;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `students_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export CSV');
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportPDF = async () => {
        setExportLoading(true);
        try {
            const dataToExport = await fetchExportData();
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const accentColor = '#F26A21'; // Primary Orange

            // Header Background
            doc.setFillColor(accentColor);
            doc.rect(0, 0, pageWidth, 40, 'F');

            // Institutional Branding
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('COLLEGE OF COMPUTER STUDIES', 14, 20);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('CCS Profiling System - Student Management Division', 14, 28);
            
            // Report Details Box
            doc.setFillColor(248, 249, 250);
            doc.roundedRect(14, 45, pageWidth - 28, 30, 2, 2, 'F');
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('STUDENT DATA REPORT', 20, 55);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 62);
            doc.text(`Total Records: ${dataToExport.length}`, 20, 68);

            // Filter Summary (if any)
            const reportTitle = getReportTitle().replace('Student Report: ', '');
            if (reportTitle !== 'All Students') {
                const splitFilters = doc.splitTextToSize(`Filters: ${reportTitle}`, pageWidth - 40);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.text(splitFilters, 20, 75);
            }

            const tableData = dataToExport.map(s => {
                const latestRecord = (s.academicRecords || s.academic_records || [])[0] || {};
                const skills = s.skills?.map(sk => sk.skill_name) || [];
                const talents = s.talents?.map(t => t.talent_name) || [];
                const combined = [...skills, ...talents].join(', ');

                return [
                    s.id_number || s.student_id,
                    `${s.first_name} ${s.last_name}`,
                    latestRecord.course || 'N/A',
                    latestRecord.year_level || 'N/A',
                    latestRecord.gwa || 'N/A',
                    combined || 'None'
                ];
            });

            autoTable(doc, {
                head: [['Student ID', 'Full Name', 'Program', 'Year', 'GWA', 'Skills & Talents']],
                body: tableData,
                startY: 85,
                margin: { left: 14, right: 14 },
                styles: { 
                    fontSize: 8,
                    cellPadding: 3,
                    valign: 'middle',
                    overflow: 'linebreak'
                },
                headStyles: { 
                    fillColor: accentColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 20, halign: 'center' },
                    3: { cellWidth: 15, halign: 'center' },
                    4: { cellWidth: 15, halign: 'center' },
                    5: { cellWidth: 'auto' }
                },
                alternateRowStyles: {
                    fillColor: [250, 250, 250]
                }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
                doc.text('© 2026 CCS Profiling System - Official Confidential Document', 14, doc.internal.pageSize.getHeight() - 10);
            }

            doc.save(`students_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF');
        } finally {
            setExportLoading(false);
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
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 className="display-6 fw-bold mb-1" style={{ color: '#c14d0f' }}>Student Lists</h2>
                    <p className="text-muted mb-0">Advanced student profiling and comprehensive queries</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold text-white" style={{ backgroundColor: '#f37021', borderColor: '#f37021' }} onClick={() => setShowForm(true)}>
                        <i className="bi bi-plus-lg me-2"></i> Add Student
                    </button>
                </div>
            </div>

            {/* Header Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div 
                    className="card-header bg-white py-3 border-bottom border-light d-flex justify-content-between align-items-center"
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ cursor: 'pointer' }}
                >
                    <h6 className="mb-0 fw-bold d-flex align-items-center"><i className="bi bi-search me-2 text-primary"></i> Advanced Filters</h6>
                    <div>
                        <button className="btn btn-sm btn-link text-decoration-none text-muted me-3" onClick={(e) => { e.stopPropagation(); clearFilters(); }}>Clear</button>
                        <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'} text-muted`}></i>
                    </div>
                </div>
                {showFilters && (
                <div className="card-body bg-light bg-opacity-25 p-4">
                    <form onSubmit={handleFilterSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-3">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Search</label>
                                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                    <span className="input-group-text bg-white border-0"><i className="bi bi-search text-muted"></i></span>
                                    <input
                                        type="text"
                                        name="search"
                                        className="form-control border-0 shadow-none focus-ring-none"
                                        placeholder="Name or ID..."
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            <div className="col-12 col-md-3">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Academic (GWA)</label>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="min_gwa"
                                            className="form-control border-0 shadow-sm rounded-3"
                                            placeholder="Min (Best: 1.0)"
                                            value={filters.min_gwa}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="max_gwa"
                                            className="form-control border-0 shadow-sm rounded-3"
                                            placeholder="Max (Fail: 5.0)"
                                            value={filters.max_gwa}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-3">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Program</label>
                                <select name="course" className="form-select border-0 shadow-sm rounded-3" value={filters.course} onChange={handleFilterChange}>
                                    <option value="">All Programs</option>
                                    <option value="BSCS">BS Computer Science</option>
                                    <option value="BSIT">BS Information Technology</option>
                                    <option value="BSIS">BS Information Systems</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-3">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Year Level</label>
                                <select name="year_level" className="form-select border-0 shadow-sm rounded-3" value={filters.year_level} onChange={handleFilterChange}>
                                    <option value="">All Years</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                        </div>

                        {/* Skills and Talents */}
                        <div className="row g-3 mt-2">
                            {Object.entries(allSkills.reduce((groups, skill) => {
                                const type = skill.skill_type || 'Other';
                                if (!groups[type]) groups[type] = [];
                                groups[type].push(skill);
                                return groups;
                            }, {})).map(([type, skills]) => (
                                <div key={type} className="col-12 col-md-auto">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">{type}</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {skills.map(skill => {
                                            const selected = filters.skills.includes(skill.skill_name);
                                            return (
                                                <button
                                                    key={skill.skill_id}
                                                    type="button"
                                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-medium border transition-all ${selected ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary'}`}
                                                    onClick={() => handleSkillToggle(skill.skill_name)}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {selected && <i className="bi bi-check2 me-1"></i>}
                                                    {skill.skill_name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {allTalents.length > 0 && (
                                <div className="col-12 col-md-auto">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Talents</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {allTalents.map((talent) => {
                                            const selected = filters.talents.includes(talent.talent_name);
                                            return (
                                                <button
                                                    key={talent.talent_id}
                                                    type="button"
                                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-medium border transition-all ${selected ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary'}`}
                                                    onClick={() => handleTalentToggle(talent.talent_name)}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {selected && <i className="bi bi-check2 me-1"></i>}
                                                    {talent.talent_name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm fw-bold text-white">
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </div>
                )}
            </div>

            {/* Main Content Area */}
            <div>

                    <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                        <div>
                            <h5 className="fw-bold mb-0">Search Results</h5>
                            <span className="text-muted small">{totalStudents} students found</span>
                        </div>

                        <div className="d-flex gap-2 align-items-center">
                            {!isMobile && (
                                <div className="btn-group shadow-sm rounded-pill overflow-hidden me-2" style={{ border: '1px solid #dee2e6' }}>
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
                            )}

                            <div className="dropdown">
                                <button className="btn btn-outline-dark btn-sm rounded-pill fw-bold dropdown-toggle" type="button" data-bs-toggle="dropdown" disabled={exportLoading || totalStudents === 0}>
                                    {exportLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-download me-2"></i>}
                                    Export Report
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                                    <li><button className="dropdown-item" onClick={handleExportCSV}><i className="bi bi-filetype-csv text-success me-2"></i> Export as CSV</button></li>
                                    <li><button className="dropdown-item" onClick={handleExportPDF}><i className="bi bi-filetype-pdf text-danger me-2"></i> Export as PDF</button></li>
                                </ul>
                            </div>
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
                                                    const imgUrl = profile_picture ? (profile_picture.startsWith('http') ? profile_picture : `${STORAGE_URL}/${profile_picture}`) : null;

                                                    const academicRecords = student.academic_records || student.academicRecords || [];
                                                    const latestRecord = academicRecords[0] || {};

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
                                        const imgUrl = profile_picture ? (profile_picture.startsWith('http') ? profile_picture : `${STORAGE_URL}/${profile_picture}`) : null;

                                        const academicRecords = student.academic_records || student.academicRecords || [];
                                        const latestRecord = academicRecords[0] || {};

                                        return (
                                            <div className="col-12 col-md-6 col-xl-4" key={student.student_id}>
                                                <div
                                                    className="card border-0 shadow-sm rounded-4 h-100 p-3 card-stats hover-lift"
                                                    onClick={() => setSelectedStudent(student)}
                                                    style={{ cursor: 'pointer', borderLeft: '4px solid #f37021 !important' }}
                                                >
                                                    <div className="d-flex align-items-center mb-3">
                                                        {imgUrl ? (
                                                            <img src={imgUrl} alt="Student" className="rounded-circle shadow-sm object-fit-cover me-3" style={{ width: '56px', height: '56px' }} />
                                                        ) : (
                                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm" style={{ width: '56px', height: '56px' }}>
                                                                {student.first_name?.[0]}{student.last_name?.[0]}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h5 className="fw-bold mb-0 text-dark">{student.first_name} {student.last_name}</h5>
                                                            <div className="text-muted small font-monospace">{student.id_number || student.student_id}</div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-light bg-opacity-50 rounded-4 p-3 mb-3 border border-white flex-grow-1">
                                                        <div className="d-flex justify-content-between mb-2 small shadow-sm bg-white p-2 rounded-3">
                                                            <span className="text-muted">GWA</span>
                                                            <span className="fw-bold text-primary">{latestRecord.gwa || 'N/A'}</span>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-1 mt-3">
                                                            {student.skills?.slice(0, 3).map((s, i) => (
                                                                <span key={s.skill_id || i} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 fw-normal" style={{ fontSize: '0.6rem' }}>{s.skill_name}</span>
                                                            ))}
                                                            {student.skills?.length > 3 && (
                                                                <span className="badge bg-light text-muted border rounded-pill px-2 fw-normal" style={{ fontSize: '0.6rem' }}>+{student.skills.length - 3}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
                                                        <div className="d-flex gap-1">
                                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 small fw-bold">
                                                                {latestRecord.course || 'CCS'}
                                                            </span>
                                                            <span className="badge bg-dark rounded-pill px-3 py-1 small">Yr {latestRecord.year_level || '-'}</span>
                                                        </div>
                                                        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                                                            <button className="btn btn-sm btn-light rounded-circle shadow-none" onClick={(e) => handleEdit(e, student)} title="Edit"><i className="bi bi-pencil-square text-primary"></i></button>
                                                            <button className="btn btn-sm btn-light rounded-circle shadow-none" onClick={(e) => { e.stopPropagation(); handleArchive(student.user_id || student.user?.id); }} title="Archive"><i className="bi bi-archive text-warning" style={{ color: '#f37021' }}></i></button>
                                                            <button className="btn btn-sm btn-light rounded-circle shadow-none" onClick={(e) => handleDelete(e, student.student_id)} title="Delete"><i className="bi bi-trash text-danger"></i></button>
                                                        </div>
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
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 p-md-4 bg-white rounded-4 shadow-sm border border-light mt-4 gap-3">
                                    <div className="small text-muted fw-medium order-2 order-md-1">
                                        Showing <span className="text-dark fw-bold">{(currentPage - 1) * 24 + 1}</span> to <span className="text-dark fw-bold">{Math.min(currentPage * 24, totalStudents)}</span> of <span className="text-dark fw-bold">{totalStudents}</span> records
                                    </div>
                                    <nav aria-label="Page navigation" className="order-1 order-md-2">
                                        <ul className="pagination pagination-sm mb-0 gap-1">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link rounded-3 border shadow-none px-3" onClick={() => handlePageChange(currentPage - 1)}>
                                                    <i className="bi bi-chevron-left me-1"></i> Prev
                                                </button>
                                            </li>
                                            
                                            <li className="page-item d-none d-sm-inline-block">
                                                <span className="page-link border-0 text-dark fw-bold bg-transparent px-3">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                            </li>

                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button className="page-link rounded-3 border shadow-none px-3" onClick={() => handlePageChange(currentPage + 1)}>
                                                    Next <i className="bi bi-chevron-right ms-1"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
        </div>
    );
};

export default StudentList;
