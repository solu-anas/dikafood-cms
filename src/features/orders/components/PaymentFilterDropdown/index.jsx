import React from "react";
import PropTypes from 'prop-types';
import "./styles.scss";

const PaymentFilterDropdown = ({ activeFilter, onFilterChange, paymentCounts }) => {
  const filters = [
    {
      id: "all",
      name: "All",
      count: paymentCounts.all || 0
    },
    {
      id: "paid",
      name: "paid",
      count: paymentCounts.paid || 0
    },
    {
      id: "unpaid",
      name: "unpaid",
      count: paymentCounts.unpaid || 0
    },
    {
      id: "pending",
      name: "pending",
      count: paymentCounts.pending || 0
    }
  ];

  return (
    <div className="payment-filter-dropdown">
      {filters.map((filter) => (
        <div
          key={filter.id}
          className={`payment-filter-item ${activeFilter === filter.id ? "active" : ""}`}
          onClick={() => onFilterChange(filter.id)}
        >
          <div className="filter-radio">
            <input 
              type="radio" 
              name="payment-filter" 
              checked={activeFilter === filter.id} 
              onChange={() => {}} 
            />
          </div>
          <div className="filter-text">
            <span className="filter-name">{filter.name}</span>
            <span className="filter-count">({filter.count})</span>
          </div>
        </div>
      ))}
    </div>
  );
};

PaymentFilterDropdown.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  paymentCounts: PropTypes.object.isRequired
};

export default PaymentFilterDropdown; 