import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const DocumentUpload = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchDocuments = async () => {
        try {
            const response = await api.get('/documents');
            setDocuments(response.data.documents);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setErrorMsg('Failed to load required documents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileUpload = async (e, docId) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingId(docId);
        setErrorMsg('');

        const formData = new FormData();
        formData.append('document_type_id', docId);
        formData.append('file', file);
        // Expiry date could be added via another input if needed

        try {
            await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchDocuments(); // Refresh list to show new status
        } catch (error) {
            console.error('Error uploading document:', error);
            setErrorMsg(error.response?.data?.message || 'Error uploading file.');
        } finally {
            setUploadingId(null);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved': return { color: 'success', label: 'Approved', icon: 'bi-check-circle-fill' };
            case 'pending': return { color: 'warning', label: 'Pending Verification', icon: 'bi-hourglass-split' };
            case 'rejected': return { color: 'danger', label: 'Rejected / Resubmit', icon: 'bi-exclamation-triangle-fill' };
            default: return { color: 'secondary', label: 'Missing Document', icon: 'bi-file-earmark-plus' };
        }
    };

    return (
        <div>
            {errorMsg && <div className="alert alert-danger mb-4 rounded-3">{errorMsg}</div>}

            {/* Top Upload Area */}
            <div className="card shadow-sm border-0 rounded-4 p-5 mb-4 text-center bg-white">
                <div className="bg-primary bg-opacity-10 text-primary rounded-4 d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '70px', height: '70px' }}>
                    <i className="bi bi-cloud-arrow-up fs-2 text-primary"></i>
                </div>
                <h5 className="fw-bold mb-3 text-dark">Document Upload</h5>
                <p className="small text-muted mb-3 mx-auto" style={{ maxWidth: '600px', lineHeight: '1.6' }}>
                    Note: File upload functionality requires server-side storage. Documents are tracked in the system.
                </p>
                <div className="small text-muted">Supported: PDF, JPG, PNG (Max 5MB)</div>
            </div>

            {/* Required Documents List */}
            <div className="card shadow-sm border-0 rounded-4 p-4 pb-5 bg-white">
                <h5 className="fw-bold mb-4 text-dark">Required Documents</h5>

                <div className="d-flex flex-column gap-3">
                    {documents.map((doc) => {
                        const statusInfo = getStatusInfo(doc.status);
                        return (
                            <div key={doc.document_type_id} className="d-flex align-items-center p-4 rounded-4 bg-white border shadow-sm transition-all hover-shadow-lg mb-2">
                                <div className={`bg-${statusInfo.color} bg-opacity-10 text-${statusInfo.color} rounded-circle d-flex align-items-center justify-content-center me-4`} style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                                    <i className={`bi ${statusInfo.icon} fs-4`}></i>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-1 text-dark fs-5">
                                        {doc.name}
                                        {doc.is_mandatory && <span className="ms-2 badge bg-danger text-white rounded-pill x-small px-2" style={{ fontSize: '0.6rem', verticalAlign: 'middle' }}>REQUIRED</span>}
                                    </h6>
                                    <div className="small text-muted">{doc.description || 'Verification requirement.'}</div>
                                    {doc.file_path && (
                                        <div className="mt-2">
                                            <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light border rounded-pill px-3 text-primary fw-bold shadow-none" style={{ fontSize: '0.75rem' }}>
                                                <i className="bi bi-file-earmark-pdf me-1"></i> View Submitted Record
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex flex-column align-items-end justify-content-center gap-2" style={{ minWidth: '160px' }}>
                                    <span className={`badge bg-${statusInfo.color} bg-opacity-10 text-${statusInfo.color} px-3 py-2 rounded-pill fw-bold border border-${statusInfo.color} border-opacity-25 w-100 text-center`}>
                                        {statusInfo.label}
                                    </span>

                                    <div className="position-relative w-100 mt-1">
                                        <input
                                            type="file"
                                            id={`upload-${doc.document_type_id}`}
                                            className="d-none"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileUpload(e, doc.document_type_id)}
                                            disabled={uploadingId === doc.document_type_id || doc.status === 'approved'}
                                        />
                                        <label
                                            htmlFor={`upload-${doc.document_type_id}`}
                                            className={`btn btn-sm py-2 rounded-pill fw-bold w-100 shadow-sm transition-all ${doc.status === 'approved' ? 'btn-light text-muted' : (doc.status === 'missing' ? 'btn-primary' : 'btn-outline-primary')}`}
                                            style={{ cursor: (uploadingId === doc.document_type_id || doc.status === 'approved') ? 'not-allowed' : 'pointer' }}
                                        >
                                            {uploadingId === doc.document_type_id ? (
                                                <div className="spinner-border spinner-border-sm" role="status"></div>
                                            ) : (
                                                <>{doc.status === 'missing' ? 'Upload Now' : (doc.status === 'approved' ? 'Verified' : 'Update File')}</>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {documents.length === 0 && (
                        <div className="text-center text-muted p-5 rounded-4 bg-light bg-opacity-50 border border-dashed">
                            <i className="bi bi-file-earmark-check display-4 mb-3 d-block text-secondary opacity-25"></i>
                            No documents required at this time.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
