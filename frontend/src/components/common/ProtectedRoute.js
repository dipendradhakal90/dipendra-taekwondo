import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { clearAdminToken, getAdminToken } from "../../utils/adminAuth";

export default function ProtectedRoute({ children }) {
  const token = getAdminToken();
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    api
      .get("/auth/me")
      .then(() => setOk(true))
      .catch(() => {
        clearAdminToken();
        setOk(false);
      })
      .finally(() => setChecking(false));
  }, [token]);

  if (!token) return <Navigate to="/admin/login" replace />;
  if (checking) return null;
  if (!ok) return <Navigate to="/admin/login" replace />;

  return children;
}

