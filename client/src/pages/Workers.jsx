import React, { useState, useEffect, useRef } from 'react';
const baseURL = process.env.REACT_APP_BASE_URL;

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const hasMounted = useRef(false);

  // Fetch worker data from the server
  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${baseURL}/worker`);
      if (!response.ok) throw new Error('Failed to fetch workers');
      const data = await response.json();
      setWorkers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Track call button clicks
  const trackCallClick = async () => {
    try {
      await fetch(`${baseURL}/stats/track-call-click`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to track call click:', error.message);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      fetchWorkers();
    }
  }, []);

  // Filter workers by job type
  const filteredWorkers = workers.filter(worker => {
    return jobTypeFilter === 'all' || worker.jobType === jobTypeFilter;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      {/* Job Type Filter */}
      <div id="filter" className="pt-2 w-75 d-flex justify-content-center">
        <select
          className="form-select w-auto"
          value={jobTypeFilter}
          onChange={(e) => setJobTypeFilter(e.target.value)}
        >
          <option value="all">Barcha ish turlari</option>
          <option value="Tikuvchilik">Tikuvchilik</option>
          <option value="Duradgorlik">Duradgorlik</option>
          <option value="To`quvchilik">To`quvchilik</option>
          <option value="Taqinchoqlar">Taqinchoqlar</option>
          <option value="Haykaltaroshlik">Haykaltaroshlik</option>
          <option value="Rassomlik">Rassomlik</option>
          <option value="Boshqalar">Boshqalar</option>
        </select>
      </div>

      {/* Worker Cards */}
      {filteredWorkers.length === 0 ? (
        <p>Hozircha bu toifada ishlar mavjud emas</p>
      ) : (
        <div id="cardContainer" className="w-100 p-5">
          {filteredWorkers.map((worker) => (
            <div id="shadow" key={worker.id} className="card border-primary bg-body rounded mb-3">
              {/* Header: Full Name and Created At */}
              <div className="d-flex card-header justify-content-between mb-2">
                <span><strong>{worker.user_name}</strong></span>
                <span>E'lon sanasi: <strong>{new Date(worker.created_at).toLocaleDateString("en-GB")}</strong></span>
              </div>

              {/* Image Slider */}
              {worker.images && worker.images.length > 0 && (
                <div className="card-body">
                  <div id={`carousel-${worker.id}`} className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                      {worker.images.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          data-bs-target={`#carousel-${worker.id}`}
                          data-bs-slide-to={index}
                          className={index === 0 ? "active" : ""}
                          aria-current={index === 0 ? "true" : "false"}
                          aria-label={`Slide ${index + 1}`}
                        ></button>
                      ))}
                    </div>
                    <div className="carousel-inner" style={{ 
                      aspectRatio: '16/9', 
                      maxHeight: '400px', 
                      overflow: 'hidden' 
                    }}>
                      {worker.images.map((img, index) => (
                        <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                          <img
                            src={img}
                            className="d-block w-100"
                            alt={`Worker ${worker.id} - ${index + 1}`}
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
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target={`#carousel-${worker.id}`}
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Previous</span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target={`#carousel-${worker.id}`}
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="card-body mb-2">
                <textarea className="form-control" value={worker.description} readOnly rows="3" />
              </div>

              {/* Footer: Location and Job Type */}
              <div className="d-flex card-footer justify-content-between">
                <span>Manzil: <strong>{worker.location}</strong></span>
                <span>Ish turi: <strong>{worker.jobType}</strong></span>
              </div>

              {/* Footer: Price and Call Button */}
              <div className="d-flex card-footer justify-content-between">
                <span>Ish haqi: <strong className="text-success">{worker.price} Soʻm</strong></span>
                <a href={`tel:${worker.phone_number}`} className="text-decoration-none">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={trackCallClick}
                  >
                    <i className="bi bi-telephone-fill me-1"></i>
                    <small>Telefon qilish</small>
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workers;