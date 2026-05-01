import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import Chart from 'chart.js/auto';

const AdminReports = () => {
    const [reportType, setReportType] = useState('students');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const fetchReport = async (type) => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/reports/${type}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(reportType);
    }, [reportType]);

    useEffect(() => {
        if (!data || !chartRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const distributionData = reportType === 'students' ? data.program_distribution : data.department_distribution;
        
        if (!distributionData) return;

        const labels = Object.keys(distributionData);
        const values = Object.values(distributionData);

        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Population Count',
                    data: values,
                    backgroundColor: reportType === 'students' ? '#F26A21' : '#0d6efd',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });

        return () => {
            if (chartInstance.current) chartInstance.current.destroy();
        };
    }, [data, reportType]);

    const handleExportCSV = () => {
        if (!data) return;

        const rows = document.querySelectorAll('table tr');
        let csvContent = "data:text/csv;charset=utf-8,";

        rows.forEach(function (rowArray) {
            let row = [], cols = rowArray.querySelectorAll("td, th");

            for (let j = 0; j < cols.length; j++)
                row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');

            csvContent += row.join(",") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && !data) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;

    return (
        <div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Institutional Reports</h2>
                    <p className="text-secondary mb-0">Generate and export structured summaries of university constituents.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <button onClick={handleExportCSV} className="btn btn-outline-success fw-bold rounded-pill px-4">
                        <i className="bi bi-file-earmark-excel me-2"></i>Export CSV
                    </button>
                    <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                        <button onClick={() => setReportType('students')} className={`btn fw-bold px-4 ${reportType === 'students' ? 'btn-primary' : 'btn-light'}`}>Students</button>
                        <button onClick={() => setReportType('faculty')} className={`btn fw-bold px-4 ${reportType === 'faculty' ? 'btn-primary' : 'btn-light'}`}>Faculty</button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
            ) : (
                <>
                    <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center bg-white h-100">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-4" style={{ width: '64px', height: '64px' }}>
                                    <i className="bi bi-people fs-3"></i>
                                </div>
                                <div>
                                    <div className="text-muted small fw-bold text-uppercase mb-1">Total Active {reportType}</div>
                                    <h2 className="fw-bold mb-0 text-dark">{data?.summary?.total_active || 0}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center bg-white h-100">
                                <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center me-4" style={{ width: '64px', height: '64px' }}>
                                    <i className="bi bi-archive fs-3"></i>
                                </div>
                                <div>
                                    <div className="text-muted small fw-bold text-uppercase mb-1">Total Archived Profiles</div>
                                    <h2 className="fw-bold mb-0 text-dark">{data?.summary?.total_archived || 0}</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white mb-4">
                        <div className="p-4 border-bottom bg-light">
                            <h5 className="fw-bold mb-0">Demographic Distribution Output</h5>
                        </div>
                        <div className="p-4" style={{ height: '300px' }}>
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">{reportType === 'students' ? 'Student Data' : 'Faculty Employment Data'}</h5>
                            <span className="badge bg-secondary rounded-pill px-3 shadow-sm">{reportType === 'students' ? data?.students_data?.length : data?.faculty_data?.length} Records</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Name</th>
                                        <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">Email</th>
                                        {reportType === 'students' ? (
                                            <>
                                                <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">Program / Course</th>
                                                <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">GWA</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">Department</th>
                                                <th className="py-3 text-muted small text-uppercase fw-bold border-bottom-0">Status</th>
                                            </>
                                        )}
                                        <th className="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-end">Joined At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(reportType === 'students' ? data?.students_data : data?.faculty_data)?.map((item, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3 fw-bold">{item.name}</td>
                                            <td className="py-3 text-muted">{item.email}</td>
                                            {reportType === 'students' ? (
                                                <>
                                                    <td className="py-3"><span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3">{item.course}</span></td>
                                                    <td className="py-3"><span className="fw-bold text-primary">{item.gwa}</span></td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-3"><span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3">{item.department}</span></td>
                                                    <td className="py-3 text-capitalize">{item.status}</td>
                                                </>
                                            )}
                                            <td className="px-4 py-3 text-end text-muted small">{item.joined_at}</td>
                                        </tr>
                                    ))}
                                    {((reportType === 'students' ? data?.students_data : data?.faculty_data)?.length || 0) === 0 && (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">No records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminReports;
