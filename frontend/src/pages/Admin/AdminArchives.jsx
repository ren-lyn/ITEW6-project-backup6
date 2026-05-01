import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminArchives = () => {
    const [archivedUsers, setArchivedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchArchives = async () => {
        try {
            const response = await api.get('/admin/archives');
            setArchivedUsers(response.data.archived_users);
        } catch (error) {
            console.error('Error fetching archives:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArchives();
    }, []);

    const handleRestore = async (id) => {
        if (!window.confirm('Are you sure you want to restore this profile?')) return;

        setActionLoading(id);
        try {
            await api.post(`/admin/users/${id}/restore`);
            fetchArchives();
        } catch (error) {
            console.error('Error restoring user:', error);
            alert('Error restoring profile. Check logs.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;

    return (
        <div>
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Archived Profiles</h2>
                <p className="text-secondary">View and restore users who have been soft-deleted from the system.</p>
            </div>

            {isMobile ? (
                <div className="row g-3">
                    {archivedUsers.map((user) => (
                        <div className="col-12" key={user.id}>
                            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white opacity-75">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h6 className="mb-0 fw-bold text-decoration-line-through text-muted">{user.name}</h6>
                                        <div className="small text-muted">{user.email}</div>
                                    </div>
                                    <span className={`badge ${user.role === 'faculty' ? 'bg-info' : 'bg-primary'} rounded-pill text-capitalize opacity-50`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="small text-muted mb-3 italic">Archived: {new Date(user.deleted_at).toLocaleDateString()}</div>
                                <button
                                    className="btn btn-success rounded-pill fw-bold w-100 shadow-sm"
                                    onClick={() => handleRestore(user.id)}
                                    disabled={actionLoading === user.id}
                                >
                                    {actionLoading === user.id ? 'Restoring...' : <><i className="bi bi-arrow-counterclockwise me-2"></i>Restore Profile</>}
                                </button>
                            </div>
                        </div>
                    ))}
                    {archivedUsers.length === 0 && (
                        <div className="col-12 text-center py-5 text-muted bg-white rounded-4 shadow-sm">
                            <i className="bi bi-archive d-block fs-1 opacity-50 mb-2"></i>
                            <h6 className="fw-bold">No Archived Data</h6>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Name</th>
                                    <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">Email</th>
                                    <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">Account Type</th>
                                    <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-center">Date Archived</th>
                                    <th className="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {archivedUsers.map((user) => (
                                    <tr key={user.id} className="opacity-75 bg-light">
                                        <td className="px-4 py-3 fw-bold text-decoration-line-through text-muted">{user.name}</td>
                                        <td className="py-3 text-muted">{user.email}</td>
                                        <td className="py-3">
                                            <span className={`badge ${user.role === 'faculty' ? 'bg-info' : 'bg-primary'} rounded-pill text-capitalize opacity-50`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center text-muted small">
                                            {new Date(user.deleted_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <button
                                                className="btn btn-sm btn-outline-success rounded-pill fw-bold px-3"
                                                onClick={() => handleRestore(user.id)}
                                                disabled={actionLoading === user.id}
                                            >
                                                {actionLoading === user.id ? 'Restoring...' : <><i className="bi bi-arrow-counterclockwise me-1"></i>Restore Profile</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {archivedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <i className="bi bi-archive d-block fs-1 text-secondary opacity-50 mb-3"></i>
                                            <h5 className="fw-bold">No Archived Data</h5>
                                            <p className="mb-0">All user profiles are currently active in the system.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminArchives;
