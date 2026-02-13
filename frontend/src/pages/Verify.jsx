import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Verify() {
  const navigate = useNavigate();
  const identifier = localStorage.getItem("identifier");
  const token = localStorage.getItem("token");

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (token) {
      navigate("/welcome", { replace: true });
    }
    if (!identifier) {
      navigate("/", { replace: true });
    }
  }, []);

  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [remainingTime]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const maskIdentifier = (id) => {
    if (id.includes("@")) {
      const [name, domain] = id.split("@");
      return name.slice(0, 2) + "****@" + domain;
    }
    return "******" + id.slice(-4);
  };

  const handleChange = (element, index) => {
    if (!/^[0-9]?$/.test(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputsRef.current[index - 1].focus();

        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1].focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Enter full 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/verify-otp", {
        identifier,
        otp: finalOtp,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/welcome", { replace: true });
    } catch (err) {
      if (err.response?.status === 403) {
        setBlocked(true);
        setRemainingTime(err.response.data.remainingTime);
      } else {
        setError(err.response?.data.message || "Error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (blocked) return;

    try {
      await API.post("/auth/request-otp", { identifier });
      setError("New OTP sent (check console)");
    } catch (err) {
      if (err.response?.status === 403) {
        setBlocked(true);
        setRemainingTime(err.response.data.remainingTime);
      }
    }
  };

  return (
    <div className="otp-container">
      <h2>Verify OTP</h2>
      <p className="sub-text">
        Enter the 6-digit code sent to{" "}
        <b>{maskIdentifier(identifier)}</b>
      </p>

      <div className="otp-inputs">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={data}
            ref={(el) => (inputsRef.current[index] = el)}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={blocked}
          />
        ))}
      </div>

      {blocked && (
        <p className="error-text">
          Blocked for {formatTime(remainingTime)}
        </p>
      )}

      {error && <p className="error-text">{error}</p>}

      <button
        className="verify-btn"
        onClick={handleVerify}
        disabled={loading || blocked}
      >
        {loading ? <div className="spinner"></div> : "Verify"}
      </button>

      <p className="resend-text">
        Didn’t receive code?{" "}
        <span
          onClick={!blocked ? handleResend : undefined}
          className={blocked ? "disabled-link" : ""}
        >
          Send Again
        </span>
      </p>
    </div>
  );
}

export default Verify;
