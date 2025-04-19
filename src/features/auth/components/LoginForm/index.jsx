import { useState } from "react";
import { PiUserDuotone, PiEnvelopeDuotone, PiLockKeyDuotone, PiSignInDuotone } from "react-icons/pi";
import { Link } from "react-router-dom";
import PasswordInput from "../../../../components/forms/PasswordInput";
import Button from "../../../../components/ui/Button";
import "./styles.scss";

const LoginForm = ({ onSubmit, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <div className="input-with-icon">
            <PiEnvelopeDuotone size="20px" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            icon={<PiLockKeyDuotone size="20px" />}
          />
        </div>

        <Button type="submit" variant="primary" className="login-button">
          <PiSignInDuotone size={22} />
          Login
        </Button>
        
        <div className="auth-links">
          <Link to="/signup" className="signup-link">Create an account</Link>
          <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;