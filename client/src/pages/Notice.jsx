import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { useNavigate } from 'react-router-dom';
const baseURL = process.env.REACT_APP_BASE_URL;

// Notice Component with Toast
const Notice = ({ fetchNotices }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    location: '',
    jobType: '',
    images: []
  });
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
    }
  }, [navigate]);

  const handleClose = () => {
    setShow(false);
    setImagePreviewUrls([]);
    setFormData(prev => ({
      ...prev,
      images: []
    }));
  };

  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const selectedFiles = Array.from(files);
      setFormData(prevState => ({
        ...prevState,
        images: [...prevState.images, ...selectedFiles]
      }));
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      showToastMessage('Iltimos, avval tizimga kiring', 'danger');
      navigate('/auth/login');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', parseFloat(formData.price));
    formDataToSend.append('location', formData.location);
    formDataToSend.append('jobType', formData.jobType);
    formData.images.forEach((image) => {
      formDataToSend.append('images', image);
    });

    try {
      const response = await fetch(`${baseURL}/notices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      
      const result = await response.json();
      if (response.ok) {
        showToastMessage("Eʼlon muvaffaqiyatli joylandi!");
        setFormData({
          description: '',
          price: '',
          location: '',
          jobType: '',
          images: []
        });
        setImagePreviewUrls([]);
        fetchNotices();
        handleClose();
      } else {
        console.error('Server error:', result);
        showToastMessage(result.error || 'Xatolik yuz berdi', 'danger');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToastMessage('Server bilan bogʻlanishda xatolik', 'danger');
    }
  };

  return (
    <>
      <Button variant="success" onClick={handleShow} className="mb-3">
        E'lon joylash
      </Button>
      
      <ToastContainer position="top-center" className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide 
          bg={toastVariant}
          text={toastVariant === 'dark' ? 'white' : 'dark'}
        >
          <Toast.Header>
            <strong className="me-auto">Xabar</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>E'lon qo'shish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="notice-form" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <input
                  type="file"
                  className="form-control"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                />
                <small className="text-muted">Bir nechta rasm yuklash mumkin</small>
              </div>
              
              {imagePreviewUrls.length > 0 && (
                <div className="col-md-12 mb-3">
                  <label className="form-label">Yuklangan rasmlar</label>
                  <div className="d-flex flex-wrap gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="position-relative" style={{ width: "100px", height: "100px" }}>
                        <img 
                          src={url} 
                          alt={`Preview ${index}`} 
                          className="img-thumbnail" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                        <button 
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0"
                          onClick={() => handleRemoveImage(index)}
                          style={{ padding: "0 5px" }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="price" className="form-label">Narx</label>
                <input
                  type="number"
                  placeholder='So`m'
                  className="form-control"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="location" className="form-label">Manzil</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  placeholder="Manzilni kiriting"
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="jobType" className="form-label">Ish turi</label>
                <select
                  className="form-select"
                  id="jobType"
                  name="jobType"
                  value={formData.jobType || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Ish turini tanlang</option>
                  <option value="Tikuvchilik">Tikuvchilik</option>
                  <option value="Duradgorlik">Duradgorlik</option>
                  <option value="To`quvchilik">To`quvchilik</option>  
                  <option value="Taqinchoqlar">Taqinchoqlar</option>
                  <option value="Haykaltaroshlik">Haykaltaroshlik</option>
                  <option value="Rassomlik">Rassomlik</option>
                  <option value="Boshqalar">Boshqalar</option>
                </select>
              </div>
            </div>
            <div className="col-md-12 mb-3">
              <label htmlFor="description" className="form-label">Tavsif</label>
              <textarea
                className="form-control"
                placeholder="Batafsil ma'lumot"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Yopish
          </Button>
          <Button variant="primary" type="submit" form="notice-form">
            Joylash
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const App = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const navigate = useNavigate();

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const fetchNotices = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/notice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setNotices(data);
      } else {
        console.error('Error fetching notices:', data.error);
        showToastMessage('E\'lonlarni yuklashda xatolik', 'danger');
      }
    } catch (error) {
      console.error('Server error:', error);
      showToastMessage('Server bilan bogʻlanishda xatolik', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteClick = (noticeId) => {
    setSelectedNoticeId(noticeId);
    setShowFeedbackModal(true);
  };

  const handleFeedback = async (wasHelpful) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/notice/${selectedNoticeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ wasHelpful: wasHelpful })
      });

      if (response.ok) {
        setNotices(notices.filter(notice => notice.id !== selectedNoticeId));
        setShowFeedbackModal(false);
        setSelectedNoticeId(null);
        showToastMessage('E\'lon muvaffaqiyatli o\'chirildi');
      } else {
        console.error('Error deleting notice');
        showToastMessage('E\'lonni o\'chirishda xatolik', 'danger');
      }
    } catch (error) {
      console.error('Server error:', error);
      showToastMessage('Server bilan bogʻlanishda xatolik', 'danger');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'process':
        return 'text-warning';
      case 'completed':
        return 'text-success';
      case 'denied':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'process':
        return 'Koʻrib chiqilmoqda...';
      case 'completed':
        return 'Joylandi';
      case 'denied':
        return 'Rad etilgan';
      default:
        return 'Nomaʼlum';
    }
  };

  return (
    <div className="container mt-2 d-flex flex-column justify-content-center align-items-center">
      <Notice fetchNotices={fetchNotices} />
      
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide 
          bg={toastVariant}
          text={toastVariant === 'dark' ? 'white' : 'dark'}
        >
          <Toast.Header>
            <strong className="me-auto">Xabar</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      {loading ? (
        <p>Loading...</p>
      ) : notices.length === 0 ? (
        <h5>Hozircha e'lon yo'q</h5>
      ) : (
<div id="cardContainer" className="w-100">
  {notices.map((notice) => (
    <div id="shadow" key={notice.id} className="card border-primary bg-body rounded mb-3">
      <div className="d-flex card-header justify-content-between mb-2">
        <span><strong>{notice.user_name}</strong></span>
        <span>E'lon sanasi: <strong>{new Date(notice.created_at).toLocaleDateString("en-GB")}</strong></span>
      </div>
      {/* Display Images as Carousel */}
      {notice.images && notice.images.length > 0 && (
        <div className="card-body">
          <div id={`carousel-${notice.id}`} className="carousel slide" data-bs-ride="carousel" >
            
            {/* Indicators */}
            <div className="carousel-indicators">
              {notice.images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  data-bs-target={`#carousel-${notice.id}`}
                  data-bs-slide-to={index}
                  className={index === 0 ? "active" : ""}
                  aria-current={index === 0 ? "true" : "false"}
                  aria-label={`Slide ${index + 1}`}
                ></button>
              ))}
            </div>

            {/* Carousel Items */}
            <div className="carousel-inner" style={{ 
              aspectRatio: '16/9', 
              maxHeight: '400px', // Adjust as needed
              overflow: 'hidden' 
            }}>
              {notice.images.map((img, index) => (
                <div key={index} className={`carousel-item ${index === 0 ? "active" : ""} `}>
                  <img
                    src={img}
                    className="d-block w-100"
                    alt={`Notice ${notice.id} - ${index + 1}`}
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Previous and Next Controls */}
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target={`#carousel-${notice.id}`}
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target={`#carousel-${notice.id}`}
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      )}
      <div className="card-body mb-2">
        <textarea
          className="form-control"
          value={notice.description}
          readOnly
          rows="3"
        />
      </div>
      <div className="d-flex card-footer justify-content-between">
        <span>Manzil: <strong>{notice.location}</strong></span>
        <span>Ish turi: <strong>{notice.jobType}</strong></span>
      </div>
      <div className="d-flex card-footer justify-content-between">
        <span>Telefon: <strong>{notice.phone_number}</strong></span>
        <span>Narx: <strong>{notice.price} Soʻm</strong></span>
      </div>
      <div className="d-flex card-footer justify-content-between">
        <span>Status: <strong className={getStatusClass(notice.status)}>{getStatusText(notice.status)}</strong></span>
        <button 
          className="btn btn-danger"
          onClick={() => handleDeleteClick(notice.id)}
        >
          <i className="bi bi-trash"></i> O'chirish
        </button>
      </div>
    </div>
  ))}
</div>
      )}

      <Modal 
        show={showFeedbackModal} 
        onHide={() => setShowFeedbackModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Fikr-mulohaza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ushbu platforma sizga yordam berdimi?
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => handleFeedback(false)}
          >
            Yo'q
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleFeedback(true)}
          >
            Ha
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;