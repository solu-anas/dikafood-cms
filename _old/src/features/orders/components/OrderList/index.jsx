import React, { useState, useEffect } from "react";
import { PiDotsThreeOutlineVertical } from "react-icons/pi";
import { formatDate, formatCurrency } from "../../../../utils/formatters";
import { getOrderStatusClass } from "../../../../utils/statusHelpers";
import OrdersFilter from "../OrdersFilter";
import "./styles.scss";

const OrderList = ({ orders, onRefresh, onOrderSelect }) => {
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    filterOrders(activeFilter);
  }, [orders, activeFilter]);

  const filterOrders = (status) => {
    if (status === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === status));
    }
  };

  const handleFilterChange = (status) => {
    setActiveFilter(status);
  };

  const handleOrderClick = (orderId) => {
    setSelectedOrderId(orderId);
    onOrderSelect(orderId);
  };

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      ordered: orders.filter(order => order.status === "ordered").length,
      packed: orders.filter(order => order.status === "packed").length,
      transit: orders.filter(order => order.status === "transit").length,
      delivered: orders.filter(order => order.status === "delivered").length
    };
    return counts;
  };

  return (
    <div className="order-list-container">
      <OrdersFilter 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange}
        statusCounts={getStatusCounts()} 
      />
      
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr 
                  key={order.id} 
                  className={`row ${selectedOrderId === order.id ? 'selected' : ''}`}
                  onClick={() => handleOrderClick(order.id)}
                >
                  <td className="order-id">{order.id}</td>
                  <td className="customer-name">{order.customer.name}</td>
                  <td className="order-date">{formatDate(order.date)}</td>
                  <td className="order-total">{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`status-badge ${getOrderStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="action-btn">
                      <PiDotsThreeOutlineVertical />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-row">
                <td colSpan="7">
                  <div className="empty-state">
                    <p>No orders found for the selected filter</p>
                    <button onClick={onRefresh} className="refresh-btn">
                      Refresh Data
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList; 