import React from 'react';
import PropTypes from 'prop-types';
import { PiCopy } from 'react-icons/pi';
import './styles.scss';

const DeliveryDetailsDropdown = ({ country, city, address }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could add a toast notification here
        console.log('Copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="delivery-details-dropdown">
      <div className="detail-item">
        <div className="detail-label">Country</div>
        <div className="detail-value-container">
          <div className="detail-value">{country}</div>
          <button 
            className="copy-button" 
            onClick={() => copyToClipboard(country)}
            aria-label="Copy country"
          >
            <PiCopy size={16} />
          </button>
        </div>
      </div>
      
      <div className="detail-item">
        <div className="detail-label">City</div>
        <div className="detail-value-container">
          <div className="detail-value">{city}</div>
          <button 
            className="copy-button" 
            onClick={() => copyToClipboard(city)}
            aria-label="Copy city"
          >
            <PiCopy size={16} />
          </button>
        </div>
      </div>
      
      <div className="detail-item">
        <div className="detail-label">Address</div>
        <div className="detail-value-container">
          <div className="detail-value">{address}</div>
          <button 
            className="copy-button" 
            onClick={() => copyToClipboard(address)}
            aria-label="Copy address"
          >
            <PiCopy size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

DeliveryDetailsDropdown.propTypes = {
  country: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired
};

export default DeliveryDetailsDropdown; 