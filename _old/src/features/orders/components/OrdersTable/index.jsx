import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import { 
  PiFunnelSimpleDuotone, 
  PiCaretUpDuotone, 
  PiCaretDownDuotone,
  PiMapPinDuotone,
  PiTruckDuotone,
  PiCoinDuotone
} from 'react-icons/pi';
import Button from '../../../../components/ui/Button';
import StatusBadge from '../StatusBadge';
import PaymentBadge from '../PaymentBadge';
import PaymentFilterDropdown from '../PaymentFilterDropdown';
import DeliveryDetailsDropdown from '../DeliveryDetailsDropdown';
import DeliveryStatusDropdown from '../DeliveryStatusDropdown';
import PaymentStatusDropdown from '../PaymentStatusDropdown';
import OrderDetailsModal from '../OrderDetailsModal';
import ConfirmationModal from '../ConfirmationModal';
import './styles.scss';

const OrdersTable = ({ 
  orders, 
  onViewOrder, 
  onEditOrder, 
  isPaymentFilterOpen,
  onTogglePaymentFilter,
  currentPaymentStatus,
  onPaymentStatusChange,
  paymentCounts,
  sortField,
  sortDirection,
  onSortChange
}) => {
  const [openDeliveryDetails, setOpenDeliveryDetails] = useState(null);
  const [openDeliveryStatus, setOpenDeliveryStatus] = useState(null);
  const [openPaymentStatus, setOpenPaymentStatus] = useState(null);
  const [orderDeliveryStatuses, setOrderDeliveryStatuses] = useState({});
  const [orderPaymentStatuses, setOrderPaymentStatuses] = useState({});
  const [viewOrderModal, setViewOrderModal] = useState({ isOpen: false, order: null });
  const [confirmPaymentModal, setConfirmPaymentModal] = useState({ isOpen: false, orderId: null });

  // Close delivery details dropdown when clicking outside
  const handleClickOutside = useCallback((event) => {
    // Close delivery details dropdown
    if (openDeliveryDetails && 
        !event.target.closest('.location-toggle') && 
        !event.target.closest('.delivery-details-dropdown')) {
      setOpenDeliveryDetails(null);
    }
    
    // Close delivery status dropdown
    if (openDeliveryStatus && 
        !event.target.closest('.status-toggle') && 
        !event.target.closest('.delivery-status-dropdown')) {
      setOpenDeliveryStatus(null);
    }

    // Close payment status dropdown
    if (openPaymentStatus && 
        !event.target.closest('.payment-toggle') && 
        !event.target.closest('.payment-status-dropdown')) {
      setOpenPaymentStatus(null);
    }
  }, [openDeliveryDetails, openDeliveryStatus, openPaymentStatus]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Initialize order delivery statuses
  useEffect(() => {
    const initialStatuses = {};
    orders.forEach(order => {
      // Map status from the order to our internal status IDs
      let status = 'ordered';
      switch(order.status.toLowerCase()) {
        case 'delivered':
          status = 'delivered';
          break;
        case 'processing':
          status = 'packed';
          break;
        case 'shipping':
        case 'intransit':
          status = 'inTransit';
          break;
        default:
          status = 'ordered';
      }
      initialStatuses[order.id] = status;
    });
    setOrderDeliveryStatuses(initialStatuses);
  }, [orders]);

  // Initialize order payment statuses
  useEffect(() => {
    const initialPaymentStatuses = {};
    orders.forEach(order => {
      let status = 'pending';
      switch(order.paymentStatus.toLowerCase()) {
        case 'paid':
          status = 'paid';
          break;
        case 'unpaid':
          status = 'unpaid';
          break;
        default:
          status = 'pending';
      }
      initialPaymentStatuses[order.id] = status;
    });
    setOrderPaymentStatuses(initialPaymentStatuses);
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <p>No orders found</p>
      </div>
    );
  }

  // Toggle delivery details dropdown
  const handleToggleDeliveryDetails = (orderId) => {
    setOpenDeliveryDetails(prevId => prevId === orderId ? null : orderId);
    // Close the other dropdowns if open
    if (openDeliveryStatus === orderId) {
      setOpenDeliveryStatus(null);
    }
    if (openPaymentStatus === orderId) {
      setOpenPaymentStatus(null);
    }
  };

  // Toggle delivery status dropdown
  const handleToggleDeliveryStatus = (orderId) => {
    setOpenDeliveryStatus(prevId => prevId === orderId ? null : orderId);
    // Close the other dropdowns if open
    if (openDeliveryDetails === orderId) {
      setOpenDeliveryDetails(null);
    }
    if (openPaymentStatus === orderId) {
      setOpenPaymentStatus(null);
    }
  };

  // Toggle payment status dropdown
  const handleTogglePaymentStatus = (orderId) => {
    setOpenPaymentStatus(prevId => prevId === orderId ? null : orderId);
    // Close the other dropdowns if open
    if (openDeliveryDetails === orderId) {
      setOpenDeliveryDetails(null);
    }
    if (openDeliveryStatus === orderId) {
      setOpenDeliveryStatus(null);
    }
  };

  // Handle delivery status change
  const handleDeliveryStatusChange = (orderId, status) => {
    setOrderDeliveryStatuses(prev => ({
      ...prev,
      [orderId]: status
    }));
    // Close the dropdown after selection
    setOpenDeliveryStatus(null);
    
    // Here you would typically update the status in your backend
    console.log(`Order ${orderId} status changed to ${status}`);
  };

  // Handle payment status change
  const handlePaymentStatusChange = (orderId, status) => {
    setOrderPaymentStatuses(prev => ({
      ...prev,
      [orderId]: status
    }));
    // Close the dropdown after selection
    setOpenPaymentStatus(null);
    
    // Here you would typically update the status in your backend
    console.log(`Order ${orderId} payment status changed to ${status}`);
  };

  // Handle viewing order details
  const handleViewOrder = (order) => {
    setViewOrderModal({
      isOpen: true,
      order
    });
  };

  // Handle marking order as paid
  const handleMarkAsPaid = (orderId) => {
    setConfirmPaymentModal({
      isOpen: true,
      orderId
    });
  };

  // Confirm marking order as paid
  const confirmMarkAsPaid = () => {
    const orderId = confirmPaymentModal.orderId;
    if (orderId) {
      // Update the payment status
      setOrderPaymentStatuses(prev => ({
        ...prev,
        [orderId]: 'paid'
      }));
      
      // Here you would typically update the status in your backend
      console.log(`Order ${orderId} marked as paid`);
    }
  };

  // Render sort icon based on current sort state
  const renderSortIcon = (field) => {
    const isActive = sortField === field;
    const icon = isActive && sortDirection === 'asc' 
      ? <PiCaretUpDuotone size={14} /> 
      : <PiCaretDownDuotone size={14} />;
    
    return (
      <button 
        className={`sort-button ${isActive ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSortChange(field);
        }}
        aria-label={`Sort by ${field} ${isActive && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
      >
        {icon}
      </button>
    );
  };

  // Get mock delivery details
  const getDeliveryDetails = (orderId) => {
    // In a real app, this would come from the order data
    return {
      country: 'Morocco',
      city: 'Meknes',
      address: 'av. Mly Ismail ang. bd Benzerte'
    };
  };

  return (
    <>
      <div className="table-container">
        <div className="table-header">
          <div 
            className="th sortable" 
            onClick={() => onSortChange('id')}
          >
            Order ID
            {renderSortIcon('id')}
          </div>
          <div className="th">Products</div>
          <div className="th">Delivery</div>
          <div className="th payment-header">
            Payment
            <button
              className="payment-filter-button"
              onClick={onTogglePaymentFilter}
            >
              <PiFunnelSimpleDuotone size={16} />
            </button>
            {isPaymentFilterOpen && (
              <PaymentFilterDropdown
                activeFilter={currentPaymentStatus}
                onFilterChange={onPaymentStatusChange}
                paymentCounts={paymentCounts}
              />
            )}
          </div>
          <div className="th">Contact</div>
          <div 
            className="th sortable" 
            onClick={() => onSortChange('date')}
          >
            Created At
            {renderSortIcon('date')}
          </div>
          <div className="th">Actions</div>
        </div>
        <div className="table-body">
          {orders.map(order => (
            <div key={order.id} className="table-row">
              <div className="td order-id">{order.id}</div>
              <div className="td">
                <div className="product-info">
                  <div className="price">{order.total} DH</div>
                  <div className="count">{order.id.includes('0') ? '2' : '3'} Products</div>
                  <div className="units">5 Units</div>
                </div>
              </div>
              <div className="td delivery-cell">
                <div className="delivery-info">
                  <div className="fee">Free</div>
                  <div className="delivery-toggles">
                    <button 
                      className={`delivery-toggle location-toggle ${openDeliveryDetails === order.id ? 'active' : ''}`}
                      onClick={() => handleToggleDeliveryDetails(order.id)}
                      aria-label="Toggle delivery details"
                    >
                      <PiMapPinDuotone size={18} />
                    </button>
                    <button 
                      className={`delivery-toggle status-toggle ${openDeliveryStatus === order.id ? 'active' : ''}`}
                      onClick={() => handleToggleDeliveryStatus(order.id)}
                      aria-label="Change delivery status"
                    >
                      <PiTruckDuotone size={18} />
                    </button>
                  </div>
                </div>
                {openDeliveryDetails === order.id && (
                  <DeliveryDetailsDropdown 
                    {...getDeliveryDetails(order.id)}
                  />
                )}
                {openDeliveryStatus === order.id && (
                  <DeliveryStatusDropdown 
                    currentStatus={orderDeliveryStatuses[order.id] || 'ordered'}
                    onStatusChange={(status) => handleDeliveryStatusChange(order.id, status)}
                  />
                )}
              </div>
              <div className="td payment-cell">
                <div className="payment-info">
                  <div className="amount">{order.total} DH</div>
                  <div className="payment-badge-container">
                    <PaymentBadge status={orderPaymentStatuses[order.id] || order.paymentStatus} />
                    <button 
                      className={`payment-toggle ${openPaymentStatus === order.id ? 'active' : ''}`}
                      onClick={() => handleTogglePaymentStatus(order.id)}
                      aria-label="Change payment status"
                    >
                      <PiCoinDuotone size={18} />
                    </button>
                  </div>
                </div>
                {openPaymentStatus === order.id && (
                  <PaymentStatusDropdown 
                    currentStatus={orderPaymentStatuses[order.id] || order.paymentStatus.toLowerCase()}
                    onStatusChange={(status) => handlePaymentStatusChange(order.id, status)}
                  />
                )}
              </div>
              <div className="td">
                <div className="contact-info">
                  <span className="name">{order.customer}</span>
                  <span className="email">{order.email}</span>
                </div>
              </div>
              <div className="td">{order.date}</div>
              <div className="td">
                <div className="action-buttons">
                  <Button 
                    variant="text" 
                    size="sm" 
                    onClick={() => handleViewOrder(order)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="text" 
                    size="sm"
                    onClick={() => handleMarkAsPaid(order.id)}
                    disabled={orderPaymentStatuses[order.id] === 'paid'}
                  >
                    Mark as Paid
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal 
        isOpen={viewOrderModal.isOpen}
        onClose={() => setViewOrderModal({ isOpen: false, order: null })}
        order={viewOrderModal.order}
      />

      {/* Confirmation Modal for marking as paid */}
      <ConfirmationModal 
        isOpen={confirmPaymentModal.isOpen}
        onClose={() => setConfirmPaymentModal({ isOpen: false, orderId: null })}
        onConfirm={confirmMarkAsPaid}
        title="Mark Order as Paid"
        message="Are you sure you want to mark this order as paid? This action cannot be undone."
        confirmText="Yes, Mark as Paid"
        cancelText="Cancel"
      />
    </>
  );
};

OrdersTable.propTypes = {
  orders: PropTypes.array.isRequired,
  onViewOrder: PropTypes.func.isRequired,
  onEditOrder: PropTypes.func.isRequired,
  isPaymentFilterOpen: PropTypes.bool.isRequired,
  onTogglePaymentFilter: PropTypes.func.isRequired,
  currentPaymentStatus: PropTypes.string.isRequired,
  onPaymentStatusChange: PropTypes.func.isRequired,
  paymentCounts: PropTypes.object.isRequired,
  sortField: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired
};

export default OrdersTable; 