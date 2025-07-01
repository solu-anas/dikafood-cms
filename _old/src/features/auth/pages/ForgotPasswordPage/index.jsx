import { useState } from "react";
import { PiEnvelopeDuotone } from "react-icons/pi";
import Button from "../../../../components/ui/Button";
import { Link } from "react-router-dom";
import "./styles.scss";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For now, just show the success message
    // In a real application, this would call an API endpoint
    if (email.trim() !== "") {
      setSubmitted(true);
    } else {
      setError("Please enter your email address");
    }
  };
  
  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <img src="/src/assets/dikafood-logo-main-3.svg" alt="DikaFood logo" className="forgot-password-logo" />
          <h1>Reset Your Password</h1>
          <p className="forgot-password-subtext">Enter your email address to receive password reset instructions</p>
        </div>
        
        {!submitted ? (
          <div className="forgot-password-form-container">
            <form className="forgot-password-form" onSubmit={handleSubmit}>
              {error && <div className="forgot-password-error">{error}</div>}
              
              <div className="form-group">
                <div className="input-with-icon">
                  <PiEnvelopeDuotone size="20px" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" variant="primary" className="forgot-password-button">
                Send Reset Link
              </Button>
              
              <div className="auth-links">
                <Link to="/login" className="login-link">Back to Login</Link>
              </div>
            </form>
          </div>
        ) : (
          <div className="forgot-password-success">
            <p>If an account exists with the email <strong>{email}</strong>, you will receive password reset instructions.</p>
            <div className="auth-links">
              <Link to="/login" className="login-link">Back to Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 