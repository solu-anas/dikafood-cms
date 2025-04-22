import React from "react";
import { 
  PiShoppingCartSimple, 
  PiPackage, 
  PiTruck, 
  PiCheckCircle,
  PiListBullets
} from "react-icons/pi";
import "./styles.scss";

const OrdersFilter = ({ activeFilter, onFilterChange, statusCounts }) => {
  const filters = [
    {
      id: "all",
      name: "All Orders",
      icon: <PiListBullets />,
      count: statusCounts.all || 0
    },
    {
      id: "ordered",
      name: "New",
      icon: <PiShoppingCartSimple />,
      count: statusCounts.ordered || 0
    },
    {
      id: "packed",
      name: "Packed",
      icon: <PiPackage />,
      count: statusCounts.packed || 0
    },
    {
      id: "transit",
      name: "In Transit",
      icon: <PiTruck />,
      count: statusCounts.transit || 0
    },
    {
      id: "delivered",
      name: "Delivered",
      icon: <PiCheckCircle />,
      count: statusCounts.delivered || 0
    }
  ];

  return (
    <div className="filter-bar">
      <div className="filter-options">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className={`filter-item ${activeFilter === filter.id ? "active" : ""}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <div className="filter-icon">
              {filter.icon}
            </div>
            <div className="filter-text">
              <div className="filter-label">{filter.name}</div>
              <div className="filter-count">{filter.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersFilter; 