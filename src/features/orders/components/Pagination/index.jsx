import { 
  PiArrowLeftDuotone,
  PiArrowRightDuotone
} from "react-icons/pi";
import PropTypes from 'prop-types';
import Button from "../../../../components/ui/Button";
import './styles.scss';

const Pagination = ({ currentPage, onPrevPage, onNextPage, isLastPage }) => {
  return (
    <div className="pagination">
      <Button 
        variant="outline" 
        size="sm"
        icon={<PiArrowLeftDuotone size={16} />}
        onClick={onPrevPage}
        disabled={currentPage === 1}
      />
      <span className="page-indicator">Page {currentPage}</span>
      <Button 
        variant="outline" 
        size="sm"
        icon={<PiArrowRightDuotone size={16} />}
        onClick={onNextPage}
        disabled={isLastPage}
      />
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  onPrevPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
  isLastPage: PropTypes.bool.isRequired
};

export default Pagination; 