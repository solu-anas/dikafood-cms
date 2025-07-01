import { useState } from "react";
import { PiEnvelopeDuotone, PiLockKeyDuotone, PiSignInDuotone, PiUserDuotone } from "react-icons/pi";
import PasswordInput from "../../../../components/forms/PasswordInput";
import Button from "../../../../components/ui/Button";
import "./styles.scss";

const SignupForm = ({ onSubmit, error }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, password, confirmPassword });
  };

  return (
    <div className="signup-form-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        {error && <div className="signup-error">{error}</div>}

        <div className="form-group">
          <div className="input-with-icon">
            <PiUserDuotone size="20px" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>

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

        <div className="form-group">
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            icon={<PiLockKeyDuotone size="20px" />}
            required
          />
        </div>

        <div className="form-group">
          <PasswordInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control"
            icon={<PiLockKeyDuotone size="20px" />}
            required
          />
        </div>

        <Button type="submit" variant="primary" className="signup-button">
          <PiSignInDuotone size={22} />
          Create Account
        </Button>
        
        <div className="auth-links">
          <a href="/login" className="login-link">Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
};

export default SignupForm; 