import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

export default function ProtectedRoute({ children, authentication = true }) {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    const isAuthenticated = authStatus === true;

    if (authentication) {
      if (!isAuthenticated) {
        navigate("/login", { state: { from: location.pathname } });
      }
    } else {
      if (isAuthenticated) {
        navigate("/");
      }
    }

    setLoader(false);
  }, [authStatus, navigate, authentication]);

  if (loader) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader size="lg" />
      </div>
    );
  }

  return children;
}
