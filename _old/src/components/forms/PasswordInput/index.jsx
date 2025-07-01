import { useState } from "react";
import { PiEyeClosedDuotone, PiEyeDuotone, PiLockKeyDuotone } from "react-icons/pi";
import "./styles.scss";

const PasswordInput = ({ placeholder, value, onChange, className, icon }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="password-input-container">
            <div className="input-with-icon">
                {icon || <PiLockKeyDuotone size="20px" />}
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder || "Password"}
                    value={value}
                    onChange={onChange}
                    className={`password-input ${className || ''}`}
                />
                <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <PiEyeClosedDuotone size="20px" />
                    ) : (
                        <PiEyeDuotone size="20px" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;