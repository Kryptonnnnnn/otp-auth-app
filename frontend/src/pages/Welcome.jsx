import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Welcome() {
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.clear();
        navigate("/", { replace: true });
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="welcome-wrapper">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <div className="welcome-center">
        <h2>Welcome {user}</h2>
      </div>
    </div>
  );
}

export default Welcome;
