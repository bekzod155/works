import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
const baseURL = process.env.REACT_APP_BASE_URL;
console.log(baseURL);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Admin = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [editNotice, setEditNotice] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        description: '',
        phone_number: '',
        price: '',
        location: '',
        jobType: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/adminauth');
        } else {
            fetchData('allnotices');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const fetchData = async (endpoint) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            let url = endpoint === 'stats' ? `${baseURL}/stats` : `${baseURL}/admin/${endpoint}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/adminauth');
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmNotice = async (noticeId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/admin/notice/${noticeId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) throw new Error('Failed to update notice status');
    
            fetchData(activeTab === 'all' ? 'allnotices' : 'inprogress');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (noticeId) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/admin/notice/${noticeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/adminauth');
                    return;
                }
                throw new Error('Failed to delete notice');
            }

            fetchData(activeTab === 'all' ? 'allnotices' : 'inprogress');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (notice) => {
        setEditNotice({
            id: notice.id,
            description: notice.description,
            phone_number: notice.phone_number,
            price: notice.price,
            location: notice.location,
            jobType: notice.jobType,
        });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditNotice((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/admin/notice/${editNotice.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: editNotice.description,
                    phone_number: editNotice.phone_number,
                    price: editNotice.price,
                    location: editNotice.location,
                    jobType: editNotice.jobType,
                })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/adminauth');
                    return;
                }
                throw new Error('Failed to update notice');
            }

            setShowModal(false);
            fetchData(activeTab === 'all' ? 'allnotices' : 'inprogress');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Please log in first');
            navigate('/adminauth');
            return;
        }

        const data = {
            description: createFormData.description,
            phone_number: createFormData.phone_number,
            price: parseFloat(createFormData.price),
            location: createFormData.location,
            jobType: createFormData.jobType,
        };

        try {
            const response = await fetch(`${baseURL}/noticesaddadmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (response.ok) {
                setMessage("Eʼlon muvaffaqiyatli joylandi!");
                setCreateFormData({
                    description: '',
                    phone_number: '',
                    price: '',
                    location: '',
                    jobType: '',
                });
                fetchData('allnotices');
                setShowCreateModal(false);
            } else {
                setMessage(result.error || 'Xatolik yuz berdi');
            }
        } catch (error) {
            setMessage('Server bilan bogʻlanishda xatolik');
        }
    };

    const handleAllAnnouncements = (e) => {
        e.preventDefault();
        setActiveTab('all');
        fetchData('allnotices');
    };

    const handleInProgress = (e) => {
        e.preventDefault();
        setActiveTab('in-progress');
        fetchData('inprogress');
    };

    const handleStatistics = (e) => {
        e.preventDefault();
        setActiveTab('stats');
        fetchData('stats');
    };

    // Bar chart data and options
    const chartData = {
        labels: [
            `Umumiy tashriflar: ${data?.home_visits || 0}`,
            `Ish qidiruvchilar: ${data?.worker_visits || 0}`,
            `Qoʻngʻiroq qilganlar: ${data?.call_button_clicks || 0}`,
            `Ish beruvchilar: ${data?.user_count-1 || 0}`,
            `Umumiy eʼlonlar: ${data?.notice_count || 0}`,
            `Admin eʼlonlari: ${data?.admin_notices || 0}`,
            `Ish beruvchi eʻlonlari: ${data?.userNoticeCount || 0}`,
        ],
        datasets: [{
            label: 'Statistics',
            data: [
                data?.home_visits || 0,
                data?.worker_visits || 0,
                data?.call_button_clicks || 0,
                data?.user_count-1 || 0,
                data?.notice_count || 0,
                data?.admin_notices || 0,
                data?.userNoticeCount || 0
            ],
            backgroundColor: [
                'red',
                'blue',
                'yellow',
                'green',
                'orange',
                'silver',
                'purple'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)'
            ],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Miqdor'
                }
            },
            x: {
                title: {
                    display: true,
                    text: ''
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            title: {
                display: true,
                text: 'Admin Statistics'
            }
        }
    };

    return (
        <div className="mt-1">
            <nav id='adminnav' className="nav nav-pills nav-fill border text-light">
                <a className={`nav-link ${activeTab === 'all' ? 'active' : ''} text-light`} href="/#" onClick={handleAllAnnouncements}>Barcha e'lonlar</a>
                <a className={`nav-link ${activeTab === 'in-progress' ? 'active' : ''} text-light`} href="/#" onClick={handleInProgress}>Jarayondagi e'lonlar</a>
                <a className={`nav-link ${activeTab === 'stats' ? 'active' : ''} text-light`} href="/#" onClick={handleStatistics}>Statistika</a>
            </nav>

            {loading && <p className="text-center mt-4">Loading...</p>}
            {error && <p className="text-center mt-4 text-danger">{error}</p>}

            <div className="m-4">
                {/* {activeTab === 'all' && (
                    <Button variant="primary" onClick={() => setShowCreateModal(true)} className="mb-3">
                        E'lon qo‘shish
                    </Button>
                )} */}

                {activeTab === 'stats' ? (
                    <div>
                        <div style={{ maxWidth: '80vw', margin: '0 auto' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                ) : (
                    data && data.length > 0 ? (
                        <div id='cardContainer' className="w-100 p-2">
                            {data.map((notice) => (
                                <div id='shadow' key={notice.id} className="card border-primary bg-body rounded mb-3">
                                    <div className="d-flex card-header justify-content-between mb-2">
                                        <div>
                                            <span><strong>{notice.user_name}</strong></span> <br />
                                            <span><strong>ID:</strong> {notice.id}</span>
                                        </div>
                                        <span>E'lon sanasi: <strong> {new Date(notice.created_at).toLocaleDateString("en-GB")} </strong> </span>
                                    </div>
                                    <div className="card-body mb-2">
                                        <textarea className="form-control" value={notice.description} readOnly rows="3" />
                                        {/* Display images if they exist */}
                                        {notice.images && notice.images.length > 0 && (
                                            <div className="mt-2">
                                                {notice.images.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`Illustration for notice ${notice.id}, item ${index + 1}`}
                                                    style={{ maxWidth: '100px', marginRight: '10px', marginBottom: '10px' }}
                                                />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="d-flex card-footer justify-content-between">
                                        <span>Ish haqi: <strong> {notice.price} </strong> so'm</span>
                                        <a href={`tel:${notice.phone_number}`} className="text-decoration-none">Telefon:<strong> {notice.phone_number} </strong></a>
                                    </div>
                                    <div className="d-flex card-footer justify-content-between">
                                        <span>Manzil: <strong>{notice.location}</strong></span>
                                        <span>Ish turi: <strong>{notice.jobType}</strong></span>
                                    </div>
                                    <div className="d-flex card-footer justify-content-between">
                                        <button className='btn btn-danger' onClick={() => handleDelete(notice.id)}>
                                            <i className="bi bi-trash"></i> <small>O'chirish</small> 
                                        </button>
                                        <button className='btn btn-warning' onClick={() => handleEdit(notice)}>
                                            <i className="bi bi-pencil"></i> <small>Tahrirlash</small>  
                                        </button>                            
                                        {activeTab !== 'all' && (
                                            <button className='btn btn-success' onClick={() => handleConfirmNotice(notice.id)}>
                                                <i className="bi bi-check"></i> <small>Tasdiqlash</small>    
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !loading && !error && <p className="text-center mt-4">No notices available</p>
                    )
                )}
            </div>

            {/* Edit Modal */}
            {editNotice && (
                <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">E'lonni Tahrirlash</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmitEdit}>
                                    <div className="mb-3">
                                        <label wirtualFor="description" className="form-label">Tavsif</label>
                                        <textarea className="form-control" id="description" name="description" value={editNotice.description} onChange={handleInputChange} rows="3" required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="phone_number" className="form-label">Telefon</label>
                                        <input type="text" className="form-control" id="phone_number" name="phone_number" value={editNotice.phone_number} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="price" className="form-label">Ish haqi (so'm)</label>
                                        <input type="number" className="form-control" id="price" name="price" value={editNotice.price} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="location" className="form-label">Manzil</label>
                                        <input type="text" className="form-control" id="location" name="location" value={editNotice.location} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="jobType" className="form-label">Ish turi</label>
                                        <select className="form-select" id="jobType" name="jobType" value={editNotice.jobType} onChange={handleInputChange} required>
                                            <option value="" disabled>Ish turini tanlang</option>
                                            <option value="Tikuvchilik">Tikuvchilik</option>
                                            <option value="Duradgorlik">Duradgorlik</option>
                                            <option value="To`quvchilik">To‘quvchilik</option>
                                            <option value="Taqinchoqlar">Taqinchoqlar</option>
                                            <option value="Haykaltaroshlik">Haykaltaroshlik</option>
                                            <option value="Rassomlik">Rassomlik</option>
                                            <option value="Boshqalar">Boshqalar</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Yopish</button>
                                <button type="button" className="btn btn-primary" onClick={handleSubmitEdit}>Saqlash</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Notice Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>E'lon qo‘shish</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label htmlFor="phone_number" className="form-label">Telefon</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    id="phone_number"
                                    name="phone_number"
                                    value={createFormData.phone_number}
                                    onChange={handleCreateChange}
                                    placeholder="+998901234567"
                                    autoComplete="tel"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="price" className="form-label">Ish haqi</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="price"
                                    name="price"
                                    value={createFormData.price}
                                    onChange={handleCreateChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label htmlFor="location" className="form-label">Manzil</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="location"
                                    name="location"
                                    value={createFormData.location}
                                    onChange={handleCreateChange}
                                    placeholder="Manzilni kiriting"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="jobType" className="form-label">Ish turi</label>
                                <select
                                    className="form-select"
                                    id="jobType"
                                    name="jobType"
                                    value={createFormData.jobType}
                                    onChange={handleCreateChange}
                                    required
                                >
                                    <option value="" disabled>Ish turini tanlang</option>
                                    <option value="Tikuvchilik">Tikuvchilik</option>
                                    <option value="Duradgorlik">Duradgorlik</option>
                                    <option value="To`quvchilik">To‘quvchilik</option>
                                    <option value="Taqinchoqlar">Taqinchoqlar</option>
                                    <option value="Haykaltaroshlik">Haykaltaroshlik</option>
                                    <option value="Rassomlik">Rassomlik</option>
                                    <option value="Boshqalar">Boshqalar</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <label htmlFor="description" className="form-label">Tavsif</label>
                            <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                value={createFormData.description}
                                onChange={handleCreateChange}
                                required
                            />
                        </div>
                    </form>
                    {message && <div className="text-center mt-2">{message}</div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Yopish</Button>
                    <Button variant="primary" onClick={handleCreateSubmit}>Joylash</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Admin;