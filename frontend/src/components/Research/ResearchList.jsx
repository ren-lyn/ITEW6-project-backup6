import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ResearchForm from './ResearchForm';

const ResearchList = () => {
    const [research, setResearch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchResearch = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/research?search=${search}&page=${page}`);
            const data = response.data.data || response.data;
            setResearch(Array.isArray(data) ? data : []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(response.data.current_page || 1);
            setTotalItems(response.data.total || (Array.isArray(data) ? data.length : 0));
        } catch (error) {
            console.error('Error fetching research:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResearch(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchResearch(newPage);
            window.scrollTo(0, 0);
        }
    };

    if (showForm) {
        return <ResearchForm onSave={() => { setShowForm(false); fetchResearch(); }} onCancel={() => setShowForm(false)} />;
    }

    return (
        <div className="animate-slide-up">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <h2 className="display-6 fw-bold mb-0 text-info">Intellectual Repository</h2>
                <button className="btn btn-info text-white rounded-pill px-4 shadow-sm fw-bold" onClick={() => setShowForm(true)}>
                    <i className="bi bi-plus-lg me-2"></i>Archive Research
                </button>
            </div>

            <div className="card mb-5 border-0 shadow-sm rounded-4 p-4" style={{ background: 'linear-gradient(135deg, #0dcaf0 0%, #087990 100%)' }}>
                <div className="row align-items-center">
                    <div className="col-md-8 text-white">
                        <h4 className="fw-bold mb-2 text-white">Advance Your Academic Inquiry</h4>
                        <p className="mb-0 opacity-75">Connect with the latest technological research and publications from CCS.</p>
                    </div>
                    <div className="col-md-4 mt-3 mt-md-0">
                        <div className="input-group bg-white rounded-pill p-1 overflow-hidden">
                            <input
                                type="text"
                                className="form-control border-0 shadow-none px-4"
                                placeholder="Search Intel..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchResearch(1)}
                            />
                            <button className="btn btn-info text-white rounded-pill px-4" onClick={() => fetchResearch(1)}>Search</button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                        <span className="visually-hidden">Loading Research...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="row g-4">
                        {research.map((item) => (
                            <div className="col-md-6" key={item.id}>
                                <div className="card border-0 shadow-sm rounded-4 h-100 p-4 card-stats border-bottom border-info border-4">
                                    <div className="d-flex justify-content-between mb-3">
                                        <div className="d-flex gap-2">
                                            <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill small fw-bold">{item.research_category || 'Academic'}</span>
                                            <span className={`badge rounded-pill px-3 py-2 small fw-bold border shadow-sm ${item.research_status === 'Published' ? 'bg-success text-white' : (item.research_status === 'Ongoing' ? 'bg-warning text-dark' : 'bg-light text-dark')}`}>
                                                {item.research_status}
                                            </span>
                                        </div>
                                        <span className="text-muted small fw-bold">{item.publication_year}</span>
                                    </div>
                                    <h5 className="fw-bold mb-3">{item.title}</h5>
                                    <p className="text-secondary small mb-4 line-clamp-2" style={{ height: '40px', overflow: 'hidden' }}>{item.abstract}</p>
                                    <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top border-light">
                                        <div className="small text-muted">Lead Adviser: <span className="fw-bold text-dark">{item.adviser}</span></div>
                                        <button className="btn btn-sm btn-link text-info text-decoration-none fw-bold p-0">Detailed abstract →</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {research.length === 0 && (
                            <div className="col-12 text-center py-5">
                                <p className="text-muted">No research entries found.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 p-md-4 bg-white rounded-4 shadow-sm border border-light mt-4 gap-3">
                            <div className="small text-muted fw-medium order-2 order-md-1">
                                Showing <span className="text-dark fw-bold">{(currentPage - 1) * 20 + 1}</span> to <span className="text-dark fw-bold">{Math.min(currentPage * 20, totalItems)}</span> of <span className="text-dark fw-bold">{totalItems}</span> records
                            </div>
                            <nav aria-label="Page navigation" className="order-1 order-md-2">
                                <ul className="pagination pagination-sm mb-0 gap-1">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-3 border border-info border-opacity-25 shadow-none px-3 text-info" onClick={() => handlePageChange(currentPage - 1)}>
                                            <i className="bi bi-chevron-left me-1"></i> Prev
                                        </button>
                                    </li>
                                    
                                    <li className="page-item d-none d-sm-inline-block">
                                        <span className="page-link border-0 text-dark fw-bold bg-transparent px-3">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </li>

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-3 border border-info border-opacity-25 shadow-none px-3 text-info" onClick={() => handlePageChange(currentPage + 1)}>
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
    );
};

export default ResearchList;
