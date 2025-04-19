import { PiUserFill } from "react-icons/pi"
import "./login.scss"
import PasswordInput from "../Components/PasswordInput"
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../App";
import config from "../config";
import Loader from "../Components/Loader";

export default function Login() {
    const { isAuthenticated, isChecked, setIsAuthenticated , isManager} = useContext(Context);
    const [loginVisible, setLoginVisible] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        if (isChecked && isAuthenticated && isManager) {
            navigate('/manage/orders');
        };
        setLoginVisible(isChecked && (!isAuthenticated || !isManager))
    }, [isChecked, isAuthenticated, navigate, isManager])
    console.log("isChecked", isChecked)
    console.log("isAuthenticated", isAuthenticated)
    console.log("isManager", isManager)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(config.API_BASE + '/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setIsAuthenticated(true);
                    navigate('/manage/orders');
                }
                else {
                    setIsAuthenticated(false);
                    setError(data.error)
                    setEmail("")
                    setPassword("")
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
            // }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred. Please try again.');
        }
    };
    console.log(error)
    if (loginVisible) {
        return (
            <div className="login-page">
                <div className="login-overlay login-overlay-1"></div>
                <div className="login-overlay login-overlay-2"></div>
                <div className="login-container">
                    <div className="login-header">
                        <img src="/images/logo.png" alt="DikaFood logo" className="login-logo" />
                        <h1>Manager Dashboard</h1>
                    </div>
                    <div className="login-body">
                        <div className="login-title">
                            <span className="login-icon">
                                <PiUserFill size={"20px"} />
                            </span>
                            <h2>Login</h2>
                        </div>

                        <form className="login-form" onSubmit={handleLogin}>
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

                            <button type="submit" className="btn btn-primary login-button">
                                Log In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
    else{
        return(<><Loader /></>)
    }
}
