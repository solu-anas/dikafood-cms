import React from 'react';
import './styles.scss';

const DeliveryStatusDropdown = ({ 
  currentStatus, 
  onStatusChange 
}) => {
  const deliveryStatuses = [
    { id: 'ordered', label: 'Ordered' },
    { id: 'packed', label: 'Packed' },
    { id: 'in-transit', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="delivery-status-dropdown">
      <div className="delivery-status-dropdown-content">
        {deliveryStatuses.map((status) => (
          <div 
            key={status.id} 
            className="delivery-status-option"
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

export default DeliveryStatusDropdown; 