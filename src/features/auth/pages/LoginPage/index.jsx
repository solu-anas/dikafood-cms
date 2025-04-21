import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../../App";
import config from "../../../../config";
import Loader from "../../../../components/ui/Loader";
import LoginForm from "../../components/LoginForm";
import { mockAuthService } from "../../../../services/mockAuth";
import "./styles.scss";

const LoginPage = () => {
  const { isAuthenticated, isChecked, setIsAuthenticated, isManager } = useContext(Context);
  const [loginVisible, setLoginVisible] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isChecked && isAuthenticated && isManager) {
      navigate("/manage/orders", { replace: true });
    } else {
      setLoginVisible(isChecked && (!isAuthenticated || !isManager));
    }
  }, [isChecked, isAuthenticated, navigate, isManager]);

  const handleLogin = async ({ email, password }) => {
    setError("");
    try {
      // Check if we should use mock auth or real API
      const useMockAuth = config.USE_MOCK_AUTH || !config.API_BASE;
      
      if (useMockAuth) {
        // Use mock authentication service
        try {
          const data = await mockAuthService.login(email, password);
          if (data.success) {
            console.log("Login successful, redirecting to orders page...");
            setIsAuthenticated(true);
            
            // No need for setTimeout as the useEffect will handle the navigation
            // when isAuthenticated changes
          } else {
            setIsAuthenticated(false);
            setError(data.error);
          }
        } catch (err) {
          setIsAuthenticated(false);
          setError(err.error || "Invalid credentials");
        }
      } else {
        // Use real API
        const response = await fetch(config.API_BASE + "/auth/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsAuthenticated(true);
            // No need for explicit navigation here either
          } else {
            setIsAuthenticated(false);
            setError(data.error);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    }
  };

  if (loginVisible) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <img src="/src/assets/dikafood-logo-main-3.svg" alt="DikaFood logo" className="login-logo" />
            <h1>Welcome to DikaFood Management</h1>
            <p className="login-subtext">Please enter your credentials to access the platform</p>
          </div>
          <LoginForm onSubmit={handleLogin} error={error} />
          <div className="login-instructions">
            <h3>Test Accounts</h3>
            <div className="account-row">
              <strong>Admin:</strong> admin@dikafood.com / admin123
            </div>
            <div className="account-row">
              <strong>Test User:</strong> test@dikafood.com / test123
            </div>
            <div className="account-row">
              <strong>Customer:</strong> customer@example.com / customer
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Loader />;
};

export default LoginPage;