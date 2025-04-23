import React from 'react';
import { PiXBold, PiChatTeardropDotsDuotone, PiHeartStraightDuotone } from 'react-icons/pi';
import './styles.scss';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen) return null;
  
  // Mock order items for demo
  const orderItems = [
    {
      id: '12345',
      title: 'This is the Product and it\'s longer than usual',
      quantity: 1,
      price: 9.98,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&auto=format&fit=crop&q=80',
      properties: {
        color: 'red',
        size: 'M',
        fit: 'regular'
      }
    },
    {
      id: '12345',
      title: 'This is the Product Title',
      quantity: 2,
      price: 9.98,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&auto=format&fit=crop&q=80'
    },
    {
      id: '12345',
      title: 'This is the Product Title',
      quantity: 1,
      price: 9.98,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&auto=format&fit=crop&q=80',
      review: {
        rating: 4,
        date: '20 Sept 2024 - 19:45',
        text: 'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure.'
      }
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="order-details-modal">
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="close-button" onClick={onClose}>
            <PiXBold size={18} />
          </button>
        </div>
        
        <div className="modal-content">
          <h3 className="section-title">Ordered Items</h3>
          <div className="order-items">
            {orderItems.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <h4 className="item-title">{item.title}</h4>
                    <div className="item-actions">
                      <button className="action-button">
                        <PiChatTeardropDotsDuotone size={18} />
                      </button>
                      <button className="action-button">
                        <PiHeartStraightDuotone size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="item-info">
                    <span className="item-id">ID: #{item.id}</span>
                    <span className="item-quantity">Quantity: {item.quantity}</span>
                    <span className="item-price">Price: ${item.price}</span>
                  </div>
                  
                  {item.properties && (
                    <div className="item-properties">
                      {Object.entries(item.properties).map(([key, value]) => (
                        <div key={key} className="property">
                          <span className="property-name">{key}</span>
                          <span className="property-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {item.review && (
                    <div className="item-review">
                      <div className="review-header">
                        <span className="review-label">Review</span>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`star ${i < item.review.rating ? 'filled' : ''}`}
                            >★</span>
                          ))}
                          <span className="rating-count">{item.review.rating}/5 Stars</span>
                        </div>
                      </div>
                      <div className="review-date">Reviewed at: {item.review.date}</div>
                      <p className="review-text">{item.review.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 