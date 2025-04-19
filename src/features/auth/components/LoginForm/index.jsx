import { useState } from "react";
import { PiUserFill } from "react-icons/pi";
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
      <div className="login-title">
        <span className="login-icon">
          <PiUserFill size={"20px"} />
        </span>
        <h2>Login</h2>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </div>

        <Button type="submit" variant="primary" className="login-button">
          Log In
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;