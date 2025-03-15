import { Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
const baseURL = process.env.REACT_APP_BASE_URL;
console.log(baseURL);

const Auth = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/auth/login";

  return (
    <div id="authCont" className="container">
      <div id="auth" className="container d-flex flex-column pt-5 align-items-center ">
        <div className="text-center mb-4">
          <Link to="/auth/login">
            <button
              className={`btn me-2 ${isLogin ? "btn-success text-white" : "btn-outline-success"}`}
            >
              KIRISH
            </button>
          </Link>
          <Link to="/auth/register">
            <button
              className={`btn ${!isLogin ? "btn-success text-white" : "btn-outline-success"}`}
            >
              Roʻyhatdan oʻtish
            </button>
          </Link>
        </div>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
};

const ToastContainer = ({ children }) => {
  return (
    <div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1100 }}>
      {children}
    </div>
  );
};

const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div 
      className={`toast show ${type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`} 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div className="toast-header">
        <strong className="me-auto">{type === 'success' ? 'Muvaffaqiyatli' : 'Xatolik'}</strong>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="toast" 
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullPhoneNumber = `+998${phoneNumber}`;
    const data = { phone_number: fullPhoneNumber, password };

    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("token", result.token);
        showToast("Kirish muvaffaqiyatli!");
        setTimeout(() => {
          navigate("/notice");
        }, 1000);
      } else {
        showToast(result.error || "Xatolik yuz berdi", "error");
      }
    } catch (error) {
      console.log(baseURL);
      showToast("Server bilan bogʻlanishda xatolik", "error");
    }
  };

  return (
    <>
      <div className="w-100 align d-flex justify-content-center align-items-center" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">+998</span>
            </div>
            <input
              type="number"
              className="form-control"
              placeholder="Telefon raqam"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-success w-100 mb-3">
            KIRISH
          </button>
        </form>
      </div>
      <ToastContainer>
        <Toast 
          message={toast.message} 
          type={toast.type} 
          show={toast.show} 
          onClose={hideToast} 
        />
      </ToastContainer>
    </>
  );
};

const Register = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullPhoneNumber = `+998${phoneNumber}`;
    const data = { name, phone_number: fullPhoneNumber, password };

    try {
      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Registration response:", result); // Debug log
      if (response.ok) {
        localStorage.setItem("token", result.token); // Store the JWT
        showToast("Roʻyhatdan oʻtish muvaffaqiyatli!");
        setName("");
        setPhoneNumber("");
        setPassword("");
        setTimeout(() => {
          navigate("/notice");
        }, 1000);
      } else {
        showToast(`${result.error}: ${result.details || "No details provided"}`, "error");
      }
    } catch (error) {
      showToast("Server bilan bogʻlanishda xatolik", "error");
      console.error("Error:", error);
    }
  };

  const openPolicyModal = () => {
    setShowPolicyModal(true);
  };

  const closePolicyModal = () => {
    setShowPolicyModal(false);
  };

  return (
    <>
      <div className="w-100 d-flex justify-content-center align-items-center" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Ism va familya"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon2">+998</span>
            </div>
            <input
              type="number"
              className="form-control"
              placeholder="Telefon raqam"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="privacyPolicy"
              checked={agreeToPolicy}
              onChange={(e) => setAgreeToPolicy(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="privacyPolicy">
              Shaxsiy ma'lumotlarni qayta ishlash va foydalanish shartlari
              <span 
                className="ms-1 text-success" 
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={openPolicyModal}
              >
                (Ko'rish)
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-success w-100 mb-3"
            disabled={!agreeToPolicy}
          >
            Roʻyxattan oʻtish
          </button>
        </form>
      </div>

      {/* Bootstrap Modal for Privacy Policy */}
      <div className={`modal fade ${showPolicyModal ? 'show' : ''}`} 
           style={{ display: showPolicyModal ? 'block' : 'none' }} 
           tabIndex="-1" 
           role="dialog" 
           aria-hidden={!showPolicyModal}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Shaxsiy ma'lumotlarni qayta ishlash va foydalanish shartlari</h5>
              <button type="button" className="btn-close" onClick={closePolicyModal}></button>
            </div>
            <div className="modal-body" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <b>Biz siz taqdim etgan ma'lumotlardan quyidagicha foydalanamiz:</b>
              <ul>
                <li>Xizmatlarimizni taqdim etish</li>
                <li>Xizmat sifatini yaxshilash</li>
                <li>Siz bilan aloqa o'rnatish</li>
                <li>Hisobingizni yaratish</li>
                <li>Qonunchilikka muvofiq majburiyatlarimizni bajarish</li>
              </ul>
              <b>Ma’lumotlarni Himoya Qilish</b>
              <ul>
              <li>Ma’lumotlar shifrlanadi va xavfsiz serverlarda saqlanadi.</li>
              <li>Ma’lumotlar faqat kerakli muddat davomida saqlanadi (masalan, hisob faol bo‘lgan davrda).</li>
              </ul>
              <b>Ma’lumotlarni Uchinchi Tomonlarga Berish</b>
              <ul>
              <li>Ma’lumotlar to‘lov protsessorlari yoki bulutli xosting provayderlari kabi xizmat ko‘rsatuvchilar bilan baham ko‘rilishi mumkin.</li>
              <li>Agar qonun talab qilsa, ma’lumotlar huquqni muhofaza qiluvchi organlarga beriladi.</li>
              <li>Ma’lumotlar uchinchi shaxslarga sotilmaydi yoki ijaraga berilmaydi.</li>
              </ul>
              <b>Foydalanish Shartlari:</b>
              <br />
              <b>Hisob Yaratish</b>
              <ul>
                <li>Ro‘yxatdan o‘tishda haqiqiy ma’lumotlar taqdim etilishi shart.</li>
                <li>Hisob ma’lumotlari (parollar) xavfsizligi uchun javobgarsiz.</li>
                <li>Platforma shartlarni buzish holatlarida hisobni to‘xtatib qo‘yishi mumkin.</li>
              </ul>
              <b>Taqiqlangan harakatlar</b>
              <ul>
                <li>Noqonuniy faoliyat, firibgarlik.</li>
                <li>Haqoratli yoki tahdidli xatti-harakatlar.</li>
              </ul>
              <b>Javobgarlikni Cheklash</b>
              <ul>
                <li>Platforma xizmatlarning uzluksiz yoki xatosiz ishlashini kafolatlamaydi.</li>
                <li>Foydalanuvchilar o‘z harakatlari uchun javobgar.</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closePolicyModal}>Yopish</button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={() => {
                  setAgreeToPolicy(true);
                  closePolicyModal();
                }}
              >
                Qabul qilaman
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Backdrop */}
      {showPolicyModal && (
        <div className="modal-backdrop fade show"></div>
      )}

      <ToastContainer>
        <Toast 
          message={toast.message} 
          type={toast.type} 
          show={toast.show} 
          onClose={hideToast} 
        />
      </ToastContainer>
    </>
  );
};

export default Auth;