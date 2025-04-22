import PropTypes from 'prop-types';
import Button from '../../../../components/ui/Button';
import StatusBadge from '../StatusBadge';
import PaymentBadge from '../PaymentBadge';
import './styles.scss';

const OrdersTable = ({ orders, onViewOrder, onEditOrder }) => {
  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <p>No orders found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="th">Order ID</div>
        <div className="th">Customer</div>
        <div className="th">Date</div>
        <div className="th">Status</div>
        <div className="th">Payment</div>
        <div className="th">Total</div>
        <div className="th">Actions</div>
      </div>
      <div className="table-body">
        {orders.map(order => (
          <div key={order.id} className="table-row">
            <div className="td">{order.id}</div>
            <div className="td">
              <div className="customer-info">
                <span className="name">{order.customer}</span>
                <span className="email">{order.email}</span>
              </div>
            </div>
            <div className="td">{order.date}</div>
            <div className="td">
              <StatusBadge status={order.status} />
            </div>
            <div className="td">
              <PaymentBadge status={order.paymentStatus} />
            </div>
            <div className="td">{order.total}</div>
            <div className="td">
              <div className="action-buttons">
                <Button 
                  variant="text" 
                  size="sm" 
                  onClick={() => onViewOrder(order.id)}
                >
                  View
                </Button>
                <Button 
                  variant="text" 
                  size="sm"
                  onClick={() => onEditOrder(order.id)}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

OrdersTable.propTypes = {
  orders: PropTypes.array.isRequired,
  onViewOrder: PropTypes.func.isRequired,
  onEditOrder: PropTypes.func.isRequired
};

export default OrdersTable; 