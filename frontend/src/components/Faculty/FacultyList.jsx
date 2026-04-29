import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import FacultyForm from './FacultyForm';
import FacultyDetail from './FacultyDetail';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const FacultyList = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedFacultyId, setSelectedFacultyId] = useState(null);
    const [totalFaculties, setTotalFaculties] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const availableSkills = ['Web Development', 'Machine Learning', 'Data Science', 'Database Management', 'Networking', 'Cybersecurity', 'Software Engineering'];

    const [filters, setFilters] = useState({
        search: '',
        department: '',
        rank: '',
        skills: []
    });

    const fetchFaculties = async () => {
        setLoading(true);
        try {
            let params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (key === 'skills') {
                    value.forEach(v => params.append('skills[]', v));
                } else if (value !== '') {
                    params.append(key, value);
                }
            });

            const response = await api.get(`/faculties?${params.toString()}`);
            const data = response.data.data || response.data;
            setFaculties(Array.isArray(data) ? data : []);
            setTotalFaculties(response.data.total || (Array.isArray(data) ? data.length : 0));
        } catch (error) {
            console.error('Error fetching faculties:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSkillToggle = (skill) => {
        setFilters(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchFaculties();
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            department: '',
            rank: '',
            skills: []
        });
        setTimeout(() => fetchFaculties(), 0);
    };

    const handleArchive = async (userId) => {
        if (!userId) return;
        if (!window.confirm('Are you sure you want to archive this user profile?')) return;

        try {
            await api.post(`/admin/users/${userId}/archive`);
            alert('User archived successfully');
            fetchFaculties();
        } catch (error) {
            console.error('Error archiving user:', error);
            alert(error.response?.data?.message || 'Error archiving user.');
        }
    };

    const fetchExportData = async () => {
        let params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'skills') {
                value.forEach(v => params.append('skills[]', v));
            } else if (value !== '') {
                params.append(key, value);
            }
        });
        params.append('export', 'true');

        const res = await api.get(`/faculties?${params.toString()}`);
        return Array.isArray(res.data) ? res.data : (res.data.data || []);
    };

    const getReportTitle = () => {
        let activeFilters = [];
        if (filters.search) activeFilters.push(`"${filters.search}"`);
        if (filters.department) activeFilters.push(filters.department.replace(' Department', ''));
        if (filters.rank) activeFilters.push(filters.rank);
        if (filters.skills?.length > 0) activeFilters.push(...filters.skills);
        
        if (activeFilters.length === 0) {
            return 'Faculty Report: All Faculty';
        }

        return `Faculty Report: This is the results of filtered words search: ${activeFilters.join(', ')}`;
    };

    const handleExportCSV = async () => {
        setExportLoading(true);
        try {
            const dataToExport = await fetchExportData();
            const exportData = dataToExport.map(f => {
                return {
                    'Employee ID': f.id_number || f.faculty_id,
                    'First Name': f.first_name,
                    'Last Name': f.last_name,
                    'Email': f.email || f.user?.email,
                    'Department': f.department || 'N/A',
                    'Rank': f.rank || 'N/A',
                    'Research Areas': (f.research_areas_json || []).join(', ') || 'None'
                };
            });
            let csv = Papa.unparse(exportData);
            const titleRow = `"${getReportTitle()}"\n\n`;
            csv = titleRow + csv;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `faculty_report_${new Date().toISOString().split('T')[0]}.csv`);
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
            const accentColor = '#198754'; // Primary Green

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
            doc.text('CCS Profiling System - Faculty Research & Development Division', 14, 28);
            
            // Report Details Box
            doc.setFillColor(248, 249, 250);
            doc.roundedRect(14, 45, pageWidth - 28, 30, 2, 2, 'F');
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('FACULTY DIRECTORY REPORT', 20, 55);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 62);
            doc.text(`Total Records: ${dataToExport.length}`, 20, 68);

            // Filter Summary (if any)
            const reportTitle = getReportTitle().replace('Faculty Report: ', '');
            if (reportTitle !== 'All Faculty') {
                const splitFilters = doc.splitTextToSize(`Filters: ${reportTitle}`, pageWidth - 40);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.text(splitFilters, 20, 75);
            }

            const tableData = dataToExport.map(f => {
                return [
                    f.id_number || f.faculty_id,
                    `${f.first_name} ${f.last_name}`,
                    f.department || 'N/A',
                    f.rank || 'N/A',
                    (f.research_areas_json || []).join(', ') || 'None'
                ];
            });

            autoTable(doc, {
                head: [['Employee ID', 'Full Name', 'Department', 'Academic Rank', 'Research Areas']],
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
                    2: { cellWidth: 35, halign: 'center' },
                    3: { cellWidth: 35, halign: 'center' },
                    4: { cellWidth: 'auto' }
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

            doc.save(`faculty_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF');
        } finally {
            setExportLoading(false);
        }
    };


    if (showForm) {
        return <FacultyForm onSave={() => { setShowForm(false); fetchFaculties(); }} onCancel={() => setShowForm(false)} />;
    }

    if (selectedFacultyId) {
        return <FacultyDetail facultyId={selectedFacultyId} onBack={() => setSelectedFacultyId(null)} />;
    }

    return (
        <div className="animate-slide-up">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="display-6 fw-bold mb-1" style={{ color: '#198754' }}>Faculty Lists</h2>
                    <p className="text-muted mb-0">Advanced faculty directory and comprehensive queries</p>
                </div>
                <button className="btn btn-success rounded-pill px-4 shadow-sm fw-bold" onClick={() => setShowForm(true)}>
                    <i className="bi bi-plus-lg me-2"></i> Add Faculty
                </button>
            </div>

            {/* Header Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div 
                    className="card-header bg-white py-3 border-bottom border-light d-flex justify-content-between align-items-center"
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ cursor: 'pointer' }}
                >
                    <h6 className="mb-0 fw-bold d-flex align-items-center"><i className="bi bi-search me-2 text-success"></i> Advanced Filters</h6>
                    <div>
                        <button className="btn btn-sm btn-link text-decoration-none text-muted me-3" onClick={(e) => { e.stopPropagation(); clearFilters(); }}>Clear</button>
                        <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'} text-muted`}></i>
                    </div>
                </div>
                {showFilters && (
                <div className="card-body bg-light bg-opacity-25 p-4">
                    <form onSubmit={handleFilterSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
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

                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Department</label>
                                <select name="department" className="form-select border-0 shadow-sm rounded-3" value={filters.department} onChange={handleFilterChange}>
                                    <option value="">All Departments</option>
                                    <option value="CS Department">Computer Science</option>
                                    <option value="IT Department">Information Technology</option>
                                    <option value="IS Department">Information Systems</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Academic Rank</label>
                                <select name="rank" className="form-select border-0 shadow-sm rounded-3" value={filters.rank} onChange={handleFilterChange}>
                                    <option value="">All Ranks</option>
                                    <option value="Instructor I">Instructor I</option>
                                    <option value="Instructor II">Instructor II</option>
                                    <option value="Instructor III">Instructor III</option>
                                    <option value="Assistant Professor I">Assistant Professor I</option>
                                    <option value="Assistant Professor II">Assistant Professor II</option>
                                    <option value="Assistant Professor III">Assistant Professor III</option>
                                    <option value="Associate Professor I">Associate Professor I</option>
                                    <option value="Professor I">Professor I</option>
                                </select>
                            </div>
                        </div>

                        {/* Research Areas */}
                        <div className="mt-3">
                            <label className="form-label small fw-bold text-muted text-uppercase mb-2">Research Areas</label>
                            <div className="d-flex flex-wrap gap-2">
                                {availableSkills.map((skill) => {
                                    const selected = filters.skills.includes(skill);
                                    return (
                                        <button
                                            key={skill}
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 py-1 fw-medium border transition-all ${selected ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'}`}
                                            onClick={() => handleSkillToggle(skill)}
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            {selected && <i className="bi bi-check2 me-1"></i>}
                                            {skill}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-4 d-flex justify-content-end">
                            <button type="submit" className="btn btn-success px-4 rounded-pill shadow-sm fw-bold" style={{ backgroundColor: '#198754', borderColor: '#198754' }}>
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
                            <span className="text-muted small">{totalFaculties} faculty members found</span>
                        </div>

                        <div className="d-flex gap-2 align-items-center">
                            <div className="dropdown">
                                <button className="btn btn-outline-success btn-sm rounded-pill fw-bold dropdown-toggle" type="button" data-bs-toggle="dropdown" disabled={exportLoading || totalFaculties === 0}>
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
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {faculties.map((faculty) => (
                                <div className="col-md-6 col-xl-4" key={faculty.faculty_id}>
                                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 card-stats hover-lift" onClick={() => setSelectedFacultyId(faculty.faculty_id)} style={{ cursor: 'pointer', borderLeft: '4px solid #198754 !important' }}>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                                <i className="bi bi-person fs-4"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-0 text-dark">{faculty.first_name} {faculty.last_name}</h5>
                                                <div className="text-muted small font-monospace">{faculty.id_number || faculty.faculty_id}</div>
                                            </div>
                                        </div>

                                        <div className="bg-light bg-opacity-50 rounded-4 p-3 mb-3 border border-white flex-grow-1">
                                            <div className="d-flex justify-content-between mb-2 small shadow-sm bg-white p-2 rounded-3">
                                                <span className="text-muted">Rank</span>
                                                <span className="fw-bold text-success">{faculty.rank || 'N/A'}</span>
                                            </div>
                                            <div className="d-flex flex-wrap gap-1 mt-3">
                                                {(faculty.research_areas_json || []).slice(0, 3).map((area, i) => (
                                                    <span key={i} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 fw-normal" style={{ fontSize: '0.6rem' }}>{area}</span>
                                                ))}
                                                {(faculty.research_areas_json?.length || 0) > 3 && (
                                                    <span className="badge bg-light text-muted border rounded-pill px-2 fw-normal" style={{ fontSize: '0.6rem' }}>+{(faculty.research_areas_json?.length || 0) - 3}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 small fw-bold">
                                                {faculty.department || 'N/A'}
                                            </span>
                                            <button className="btn btn-sm btn-light rounded-circle shadow-none" onClick={(e) => { e.stopPropagation(); handleArchive(faculty.user_id); }} title="Archive">
                                                <i className="bi bi-archive text-warning" style={{ color: '#f37021' }}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {faculties.length === 0 && (
                                <div className="col-12 text-center py-5">
                                    <i className="bi bi-person-x fs-1 text-muted opacity-50 mb-3 d-block"></i>
                                    <p className="text-muted fs-5">No faculty members found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
        </div>
    );
};

export default FacultyList;
