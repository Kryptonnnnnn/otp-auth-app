import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateInput = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (value.includes("@")) {
      return emailRegex.test(value);
    }

    return phoneRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateInput(identifier)) {
      setError("Enter valid email or 10-digit phone number");
      return;
    }

    try {
      await API.post("/auth/request-otp", { identifier });
      localStorage.setItem("identifier", identifier);
      navigate("/verify");
    } catch (err) {
      setError(err.response?.data.message || "Error occurred");
    }
  };

  return (
    <div className="login-container">
      <h2>OTP Login</h2>
      <p className="sub-text">
        Enter your email or phone number to receive a verification code
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email or Phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="verify-btn">
          Send OTP
        </button>
      </form>
    </div>
  );
}

export default Login;
