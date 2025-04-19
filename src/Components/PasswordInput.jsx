import { useState } from "react";
import { PiEyeClosed, PiEye } from "react-icons/pi";
import "./PasswordInput.scss";

export default function PasswordInput({ placeholder, value, onChange, className }) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="password-input-container">
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
                    <PiEyeClosed size="20px" />
                ) : (
                    <PiEye size="20px" />
                )}
            </button>
        </div>
    );
}
