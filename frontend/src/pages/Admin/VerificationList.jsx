import React, { useState, useEffect } from 'react';
import api, { STORAGE_URL } from '../../api/axios';

const VerificationList = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModalData, setRejectModalData] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchVerifications = async () => {
        try {
            const response = await api.get('/admin/verifications');
            setVerifications(response.data.verifications || []);
        } catch (error) {
            console.error('Error fetching verifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, []);

    const handleApprove = async (id) => {
        const type = id.startsWith('user_') ? 'account registration' : 'document';
        if (!window.confirm(`Are you sure you want to approve this ${type}?`)) return;
        
        setActionLoading(id);
        try {
            await api.post(`/admin/verifications/${id}/approve`);
            fetchVerifications();
        } catch (error) {
            console.error('Error approving:', error);
            alert(`Error approving ${type}.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!remarks.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        const type = rejectModalData.id.startsWith('user_') ? 'account registration' : 'document';
        setActionLoading(rejectModalData.id);
        try {
            await api.post(`/admin/verifications/${rejectModalData.id}/reject`, { remarks });
            setRejectModalData(null);
            setRemarks('');
            fetchVerifications();
        } catch (error) {
            console.error('Error rejecting:', error);
            alert(`Error rejecting ${type}.`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;

    return (
        <div>
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                    <h2 className="fw-bold mb-1">Verification Approvals</h2>
                    <p className="text-secondary mb-0">Unified list of pending account registrations and document submissions.</p>
                </div>
                <div>
                    <span className="badge bg-warning text-dark fs-6 py-2 px-3 rounded-pill shadow-sm">
                        <i className="bi bi-shield-check me-2"></i>{verifications.length} Pending Actions
                    </span>
                </div>
            </div>

            {isMobile ? (
                <div className="row g-3">
                    {verifications.map(item => (
                        <div className="col-12" key={item.id}>
                            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded-circle p-2 me-2">
                                            {item.type === 'account' ? '👤' : '📄'}
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">{item.user.name}</h6>
                                            <small className="text-muted text-uppercase fw-bold ls-tight" style={{ fontSize: '0.65rem' }}>{item.user.role}</small>
                                        </div>
                                    </div>
                                    <span className="small text-muted">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                                
                                <div className="bg-light bg-opacity-50 rounded-3 p-3 mb-3 border border-white">
                                    <h6 className="mb-1 small fw-bold text-dark">{item.document_type}</h6>
                                    {item.file_path ? (
                                        <a 
                                            href={`${STORAGE_URL}/${item.file_path}`} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="small text-decoration-none fw-bold"
                                        >
                                            <i className="bi bi-eye me-1"></i>View Document
                                        </a>
                                    ) : (
                                        <span className="small text-muted italic">Profile Verification</span>
                                    )}
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-success rounded-pill px-4 flex-grow-1 fw-bold shadow-sm"
                                        onClick={() => handleApprove(item.id)}
                                        disabled={actionLoading === item.id}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-outline-danger rounded-pill px-4 flex-grow-1 fw-bold"
                                        onClick={() => setRejectModalData(item)}
                                        disabled={actionLoading === item.id}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {verifications.length === 0 && (
                        <div className="col-12 text-center py-5 text-muted bg-white rounded-4 shadow-sm">
                            <i className="bi bi-check2-circle fs-1 d-block mb-2 text-success opacity-50"></i>
                            <h6 className="fw-bold">No pending approvals</h6>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Source</th>
                                    <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">Name</th>
                                    <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-center">Role</th>
                                    <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">Verification Type</th>
                                    <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-center">Date</th>
                                    <th className="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {verifications.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '32px', height: '32px' }}>
                                                {item.type === 'account' ? '👤' : '📄'}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div>
                                                <h6 className="mb-0 fw-bold">{item.user.name}</h6>
                                                <small className="text-muted">UID: {item.user.id}</small>
                                            </div>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className={`badge ${item.user.role === 'faculty' ? 'bg-info text-dark' : 'bg-primary'} rounded-pill text-capitalize`}>
                                                {item.user.role}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <h6 className="mb-0 small fw-bold">{item.document_type}</h6>
                                                    {item.file_path ? (
                                                        <a 
                                                            href={`${STORAGE_URL}/${item.file_path}`} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="small text-decoration-none"
                                                        >
                                                            View Document
                                                        </a>
                                                    ) : (
                                                        <span className="small text-muted italic">Profile Verification</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-center text-muted small">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button
                                                    className="btn btn-sm btn-success rounded-pill px-3"
                                                    onClick={() => handleApprove(item.id)}
                                                    disabled={actionLoading === item.id}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                    onClick={() => setRejectModalData(item)}
                                                    disabled={actionLoading === item.id}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {verifications.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <i className="bi bi-check2-circle fs-1 d-block mb-3 text-success opacity-50"></i>
                                            <h5 className="fw-bold">No pending approvals</h5>
                                            <p className="mb-0">Everything is up to date.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalData && (
                <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 2050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <form onSubmit={handleRejectSubmit}>
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="modal-title fw-bold">Reject Verification</h5>
                                    <button type="button" className="btn-close shadow-none" onClick={() => setRejectModalData(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <p className="small text-muted mb-3">
                                        Rejecting <strong>{rejectModalData.document_type}</strong> for <strong>{rejectModalData.user.name}</strong>.
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Reason for Rejection <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control bg-light shadow-none"
                                            rows="3"
                                            placeholder="Specify why this registration or document is being rejected..."
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setRejectModalData(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold" disabled={actionLoading === rejectModalData.id}>Confirm Rejection</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationList;
