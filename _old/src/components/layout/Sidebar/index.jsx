import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PiShoppingBagDuotone,
  PiUsersDuotone,
  PiTruckDuotone,
  PiCreditCardDuotone,
  PiStarDuotone,
  PiHouseDuotone,
  PiSignOutDuotone,
  PiUserCircleDuotone
} from "react-icons/pi";
import { Context } from "../../../App";
import { mockAuthService } from "../../../services/mockAuth";
import config from "../../../config";
import "./styles.scss";

const Sidebar = () => {
  const { setIsAuthenticated } = useContext(Context);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    console.log("Logging out...");
    
    if (config.USE_MOCK_AUTH) {
      mockAuthService.logout();
    } else {
      // Real API logout would go here
      localStorage.removeItem("token");
    }
    
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  const navItems = [
    {
      to: "/manage/orders",
      label: "Orders",
      icon: <PiShoppingBagDuotone size={20} />
    },
    {
      to: "/manage/products",
      label: "Products",
      icon: <PiHouseDuotone size={20} />
    },
    {
      to: "/manage/customers",
      label: "Customers",
      icon: <PiUsersDuotone size={20} />
    },
    {
      to: "/manage/reviews",
      label: "Reviews",
      icon: <PiStarDuotone size={20} />
    },
    {
      to: "/manage/delivery",
      label: "Delivery",
      icon: <PiTruckDuotone size={20} />
    },
    {
      to: "/manage/payment",
      label: "Payment",
      icon: <PiCreditCardDuotone size={20} />
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/src/assets/dikafood-logo-main-3.svg" alt="DikaFood Logo" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.to} className="nav-item">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="footer-buttons">
          <NavLink
            to="/manage/profile"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon"><PiUserCircleDuotone size={20} /></span>
          </NavLink>
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon"><PiSignOutDuotone size={20} /></span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;