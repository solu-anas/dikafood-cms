import { 
  PiCoinDuotone, 
  PiTimerDuotone,
  PiWarningCircleDuotone
} from "react-icons/pi";
import PropTypes from 'prop-types';
import './styles.scss';

const PaymentBadge = ({ status }) => {
  const statusLower = status.toLowerCase();
  const isPaid = statusLower === 'paid';
  const isPending = statusLower === 'pending';
  const isUnpaid = statusLower === 'unpaid';
  
  return (
    <span className={`payment-badge ${statusLower}`}>
      {isPaid && <PiCoinDuotone size={16} />}
      {isPending && <PiTimerDuotone size={16} />}
      {isUnpaid && <PiWarningCircleDuotone size={16} />}
      {status}
    </span>
  );
};

PaymentBadge.propTypes = {
  status: PropTypes.string.isRequired
};

export default PaymentBadge; 