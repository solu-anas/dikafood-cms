import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles.scss';
import { PiShoppingCartSimpleBold, PiUserCircle, PiDownloadSimple, PiList } from 'react-icons/pi';
import logo from '../../../assets/logo.svg';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLogin = () => setIsLoginOpen(!isLoginOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="DikaFood Logo" />
          </Link>
        </div>

        <nav className={`main-navigation ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li className={isActive('/')}>
              <Link to="/">
                <span className="icon">🏠</span>
                Accueil
              </Link>
            </li>
            <li className={isActive('/shop')}>
              <Link to="/shop">
                <span className="icon">🛒</span>
                Boutique
              </Link>
            </li>
            <li className={isActive('/blog')}>
              <Link to="/blog">
                <span className="icon">📝</span>
                Blog
              </Link>
            </li>
            <li className={isActive('/contact')}>
              <Link to="/contact">
                <span className="icon">✉️</span>
                Contactez-nous
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <Link to="/download" className="btn btn-download">
            <PiDownloadSimple />
            <span>Télécharger le catalogue</span>
          </Link>

          <div className="user-actions">
            <button className="btn-sign-in" onClick={toggleLogin}>
              <PiUserCircle size={24} />
              <span>Sign In</span>
            </button>

            <Link to="/cart" className="btn-cart">
              <PiShoppingCartSimpleBold size={24} />
              <span className="cart-count">0</span>
            </Link>
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMenu}>
            <PiList size={24} />
          </button>
        </div>
      </div>

      {isLoginOpen && (
        <div className="login-popup">
          <div className="login-form">
            <h2>Sign In</h2>
            <p>Access your account</p>

            <form>
              <div className="form-group">
                <input type="email" placeholder="Your email address" />
              </div>
              <div className="form-group">
                <input type="password" placeholder="Your password" />
              </div>
              <div className="form-options">
                <label>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password">Forgot password?</a>
              </div>
              <button type="submit" className="btn-submit">Sign In</button>
            </form>

            <div className="login-footer">
              <p>Don't have an account? <a href="/register">Register</a></p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;