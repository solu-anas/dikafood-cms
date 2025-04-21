import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../../App";
import config from "../../../../config";
import Loader from "../../../../components/ui/Loader";
import SignupForm from "../../components/SignupForm";
import { mockAuthService } from "../../../../services/mockAuth";
import "./styles.scss";

const SignupPage = () => {
  const { isAuthenticated, isChecked } = useContext(Context);
  const [signupVisible, setSignupVisible] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isChecked && isAuthenticated) {
      navigate("/manage/orders");
    }
    setSignupVisible(isChecked && !isAuthenticated);
  }, [isChecked, isAuthenticated, navigate]);

  const handleSignup = async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    try {
      // Check if we should use mock auth or real API
      const useMockAuth = config.USE_MOCK_AUTH || !config.API_BASE;
      
      if (useMockAuth) {
        // Use mock authentication service
        try {
          const result = await mockAuthService.register({ name, email, password });
          if (result.success) {
            // Redirect to login after successful signup
            navigate("/login");
          } else {
            setError(result.error);
          }
        } catch (err) {
          setError(err.error || "Registration failed");
        }
      } else {
        // Use real API
        const response = await fetch(config.API_BASE + "/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Redirect to login after successful signup
            navigate("/login");
          } else {
            setError(data.error);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("An error occurred. Please try again.");
    }
  };

  if (signupVisible) {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-header">
            <img src="/src/assets/dikafood-logo-main-3.svg" alt="DikaFood logo" className="signup-logo" />
            <h1>Create Your DikaFood Account</h1>
            <p className="signup-subtext">Fill out the form below to create your account</p>
          </div>
          <SignupForm onSubmit={handleSignup} error={error} />
        </div>
      </div>
    );
  }

  return <Loader />;
};

export default SignupPage; 