import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const baseURL = process.env.REACT_APP_BASE_URL;
console.log(baseURL);
const LoginAdmin = () => {
  const [login, setlogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { login, password };

    try {
      const response = await fetch(`${baseURL}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("token", result.token);
        setMessage("Kirish muvaffaqiyatli!");
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      } else {
        setMessage(result.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      setMessage("Server bilan bogʻlanishda xatolik");
    }
  };

  return (
    <div className="w-100 container mt-5 d-flex flex-column align-items-center" style={{ maxWidth: "400px" }}>
			<h1>Admin</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Login"
            value={login}
            onChange={(e) => setlogin(e.target.value)}
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
      {message && <div className="text-center mt-2 text-success">{message}</div>}
    </div>
  );
};

export default LoginAdmin;