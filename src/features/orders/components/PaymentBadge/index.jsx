import { 
  PiCurrencyDollarDuotone, 
  PiTimerDuotone 
} from "react-icons/pi";
import PropTypes from 'prop-types';
import './styles.scss';

const PaymentBadge = ({ status }) => {
  const isPaid = status.toLowerCase() === 'paid';
  
  return (
    <span className={`payment-badge ${isPaid ? 'paid' : 'pending'}`}>
      {isPaid ? <PiCurrencyDollarDuotone size={16} /> : <PiTimerDuotone size={16} />}
      {status}
    </span>
  );
};

PaymentBadge.propTypes = {
  status: PropTypes.string.isRequired
};

export default PaymentBadge; 