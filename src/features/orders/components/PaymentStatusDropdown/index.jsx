import React from 'react';
import './styles.scss';

const PaymentStatusDropdown = ({ 
  currentStatus, 
  onStatusChange 
}) => {
  const paymentStatuses = [
    { id: 'paid', label: 'Paid' },
    { id: 'pending', label: 'Pending' },
    { id: 'unpaid', label: 'Unpaid' }
  ];

  return (
    <div className="payment-status-dropdown">
      <div className="payment-status-dropdown-content">
        {paymentStatuses.map((status) => (
          <div 
            key={status.id} 
            className="payment-status-option"
            onClick={() => onStatusChange(status.id)}
          >
            <div className={`status-radio ${currentStatus === status.id ? 'selected' : ''}`}>
              {currentStatus === status.id && <div className="radio-inner" />}
            </div>
            <span>{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentStatusDropdown; 