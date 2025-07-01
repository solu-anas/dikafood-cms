import { FaSearch } from 'react-icons/fa';
import { PiFunnelDuotone } from "react-icons/pi";
import PropTypes from 'prop-types';
import Button from '../../../../components/ui/Button';
import './styles.scss';
import { useRef } from 'react';

const OrdersHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onFilterToggle 
}) => {
  const filterButtonRef = useRef(null);
  
  const handleFilterToggle = () => {
    onFilterToggle(filterButtonRef);
  };
  
  return (
    <div className="header-actions">
      <div className="search-and-actions">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="action-buttons">
          <Button
            variant="secondary"
            icon={<PiFunnelDuotone size={18} />}
            onClick={handleFilterToggle}
            ref={filterButtonRef}
            className="filter-button"
          >
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
};

OrdersHeader.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onFilterToggle: PropTypes.func.isRequired
};

export default OrdersHeader; 