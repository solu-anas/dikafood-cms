import { NavLink } from "react-router-dom";
import {
  PiShoppingBag,
  PiUsers,
  PiTruck,
  PiCreditCard,
  PiStar,
  PiHouse
} from "react-icons/pi";
import "./styles.scss";

const Sidebar = () => {
  const navItems = [
    {
      to: "/manage/orders",
      label: "Orders",
      icon: <PiShoppingBag size={20} />
    },
    {
      to: "/manage/products",
      label: "Products",
      icon: <PiHouse size={20} />
    },
    {
      to: "/manage/customers",
      label: "Customers",
      icon: <PiUsers size={20} />
    },
    {
      to: "/manage/reviews",
      label: "Reviews",
      icon: <PiStar size={20} />
    },
    {
      to: "/manage/delivery",
      label: "Delivery",
      icon: <PiTruck size={20} />
    },
    {
      to: "/manage/payment",
      label: "Payment",
      icon: <PiCreditCard size={20} />
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/images/logo.png" alt="DikaFood Logo" className="sidebar-logo" />
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
    </aside>
  );
};

export default Sidebar;