import { 
  PiClockDuotone, 
  PiPackageDuotone, 
  PiCheckCircleDuotone 
} from "react-icons/pi";
import PropTypes from 'prop-types';
import './styles.scss';

const StatusBadge = ({ status }) => {
  const getStatusIcon = () => {
    switch(status.toLowerCase()) {
      case 'pending':
        return <PiClockDuotone size={16} />;
      case 'processing':
        return <PiPackageDuotone size={16} />;
      case 'delivered':
        return <PiCheckCircleDuotone size={16} />;
      default:
        return null;
    }
  };

  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {getStatusIcon()}
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired
};

export default StatusBadge; 