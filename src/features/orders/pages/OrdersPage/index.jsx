import { useContext, useEffect, useState } from "react";
import { 
  PiPlusDuotone, 
  PiFunnelDuotone, 
  PiMagnifyingGlassDuotone, 
  PiClipboardTextDuotone, 
  PiPackageDuotone, 
  PiHouseDuotone, 
  PiTruckDuotone,
  PiArrowRightDuotone,
  PiArrowLeftDuotone,
  PiCheckCircleDuotone,
  PiArrowsClockwiseDuotone,
  PiClockDuotone,
  PiCurrencyDollarDuotone,
  PiTimerDuotone
} from "react-icons/pi";
import Button from "../../../../components/ui/Button";
import "./styles.scss";
import config from "../../../../config";
import { FaSearch } from 'react-icons/fa';
import { BiRefresh } from 'react-icons/bi';
import OrdersTable from "../../components/OrdersTable";
import OrdersHeader from "../../components/OrdersHeader";
import OrdersFilter from "../../components/OrdersFilter";
import Pagination from "../../components/Pagination";

// Add this export so we can access it from the parent component (Tabs)
export function refreshOrders() {
  // This is a dummy function intended to be replaced with the actual fetchOrders function
  return Promise.resolve();
}

const OrdersPage = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStatus, setCurrentStatus] = useState("all");
  const [ordersCounts, setOrdersCounts] = useState({});
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const limit = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Order status options
  const orderStatus = [
    { icon: <PiClipboardTextDuotone size={20} />, status: "ordered", label: "Ordered" },
    { icon: <PiPackageDuotone size={20} />, status: "packed", label: "Packed" },
    { icon: <PiTruckDuotone size={20} />, status: "inTransit", label: "In Transit" },
    { icon: <PiHouseDuotone size={20} />, status: "delivered", label: "Delivered" },
    { status: "all", label: "All Orders" }
  ];

  // Sample orders data - would normally come from API
  const sampleOrders = [
    { 
      id: "ORD-001", 
      customer: "John Doe", 
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      date: "2023-06-15", 
      status: "Delivered", 
      total: "$125.00",
      paymentStatus: "Paid"
    },
    { 
      id: "ORD-002", 
      customer: "Jane Smith", 
      email: "jane.smith@example.com",
      phone: "+1 (555) 987-6543",
      date: "2023-06-16", 
      status: "Processing", 
      total: "$85.50",
      paymentStatus: "Pending"
    },
    { 
      id: "ORD-003", 
      customer: "Robert Johnson", 
      email: "robert.j@example.com",
      phone: "+1 (555) 456-7890",
      date: "2023-06-17", 
      status: "Pending", 
      total: "$210.75",
      paymentStatus: "Pending"
    },
    { 
      id: "ORD-004", 
      customer: "Emma Williams", 
      email: "emma.w@example.com",
      phone: "+1 (555) 234-5678",
      date: "2023-06-18", 
      status: "Delivered", 
      total: "$95.20",
      paymentStatus: "Paid"
    },
    { 
      id: "ORD-005", 
      customer: "Michael Brown", 
      email: "michael.b@example.com",
      phone: "+1 (555) 876-5432",
      date: "2023-06-19", 
      status: "Processing", 
      total: "$150.75",
      paymentStatus: "Pending"
    },
    { 
      id: "ORD-006", 
      customer: "Olivia Davis", 
      email: "olivia.d@example.com",
      phone: "+1 (555) 345-6789",
      date: "2023-06-20", 
      status: "Pending", 
      total: "$78.50",
      paymentStatus: "Pending"
    },
    { 
      id: "ORD-007", 
      customer: "William Miller", 
      email: "william.m@example.com",
      phone: "+1 (555) 654-3210",
      date: "2023-06-21", 
      status: "Delivered", 
      total: "$220.30",
      paymentStatus: "Paid"
    },
    { 
      id: "ORD-008", 
      customer: "Sophia Wilson", 
      email: "sophia.w@example.com",
      phone: "+1 (555) 765-4321",
      date: "2023-06-22", 
      status: "Processing", 
      total: "$135.45",
      paymentStatus: "Paid"
    },
    { 
      id: "ORD-009", 
      customer: "James Taylor", 
      email: "james.t@example.com",
      phone: "+1 (555) 567-8901",
      date: "2023-06-23", 
      status: "Pending", 
      total: "$64.99",
      paymentStatus: "Pending"
    },
    { 
      id: "ORD-010", 
      customer: "Charlotte Anderson", 
      email: "charlotte.a@example.com",
      phone: "+1 (555) 890-1234",
      date: "2023-06-24", 
      status: "Delivered", 
      total: "$175.25",
      paymentStatus: "Paid"
    }
  ];

  // Load orders based on filters
  const fetchOrders = async () => {
    setIsRefreshing(true);
    
    // In a real app, this would be an API call with filters
    // const params = new URLSearchParams();
    // params.append('page', page);
    // params.append('limit', limit);
    // if (currentStatus !== 'all') {
    //   params.append('status', currentStatus);
    // }
    
    // Try-catch block for API call
    try {
      // Simulate API call
      setTimeout(() => {
        // Filter by status if needed
        let filteredOrders = [...sampleOrders];
        if (currentStatus !== 'all') {
          filteredOrders = sampleOrders.filter(order => 
            order.status.toLowerCase() === currentStatus
          );
        }
        
        // Filter by search query if present
        if (searchQuery) {
          filteredOrders = filteredOrders.filter(order => 
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setOrders(filteredOrders);
        
        // Calculate counts
        const counts = {
          ordered: sampleOrders.filter(o => o.status.toLowerCase() === 'pending').length,
          packed: sampleOrders.filter(o => o.status.toLowerCase() === 'processing').length,
          inTransit: sampleOrders.filter(o => o.status.toLowerCase() === 'intransit').length,
          delivered: sampleOrders.filter(o => o.status.toLowerCase() === 'delivered').length,
          all: sampleOrders.length
        };
        
        setOrdersCounts(counts);
        setIsRefreshing(false);
        setMessage("Data refreshed successfully");
        setTimeout(() => setMessage(""), 3000);
      }, 800);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setMessage("Failed to load orders. Please try again.");
      setIsRefreshing(false);
    }

    // Override the exported function with the actual implementation
    // This will allow the Tabs component to refresh the data when the refresh button is clicked
    window.refreshOrders = fetchOrders;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 800);
    });
  };
  
  // Handle status change
  const handleStatusChange = (status) => {
    setCurrentStatus(status);
    setPage(1); // Reset to first page when changing filters
    setIsOpenFilter(false); // Close the filter after selection
  };
  
  // Handle pagination
  const handleNextPage = () => {
    if (orders.length === limit) { // If we have a full page, there might be more
      setPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };
  
  // Load orders on mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [page, currentStatus, searchQuery]);
  
  // Handle order status change
  const handleChangeOrderStatus = (orderId, newStatus) => {
    // In a real app, this would be an API call
    // For now, just update locally
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      )
    );
    
    setMessage(`Order ${orderId} status updated to ${newStatus}`);
    setTimeout(() => setMessage(""), 3000);
  };
  
  // Toggle filter panel
  const toggleFilter = () => {
    setIsOpenFilter(prev => !prev);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refreshing data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Handle view and edit order
  const handleViewOrder = (orderId) => {
    console.log(`Viewing order ${orderId}`);
    // Implement view order functionality
  };
  
  const handleEditOrder = (orderId) => {
    console.log(`Editing order ${orderId}`);
    // Implement edit order functionality
  };

  // Handle click outside to close filter
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close filter if clicked outside
      if (isOpenFilter && !event.target.closest('.filter-button') && !event.target.closest('.filter-modal')) {
        setIsOpenFilter(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenFilter]);

  const statusCounts = {
    all: orders.length,
    ordered: orders.filter(order => order.status === 'pending').length,
    packed: orders.filter(order => order.status === 'processing').length,
    transit: orders.filter(order => order.status === 'shipping').length,
    delivered: orders.filter(order => order.status === 'completed').length
  };

  return (
    <div className="orders-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="header-title">Orders</h1>
          <div className="header-actions">
            <div className="search-container">
              <PiMagnifyingGlassDuotone className="search-icon" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-button-container">
              <button
                className={`filter-button ${isOpenFilter ? 'active' : ''}`}
                onClick={() => toggleFilter()}
              >
                <PiFunnelDuotone />
                Filter
              </button>
              {isOpenFilter && (
                <div className="filter-container">
                  <OrdersFilter 
                    activeFilter={currentStatus} 
                    onFilterChange={handleStatusChange} 
                    statusCounts={statusCounts}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-body">
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found</p>
              <Button
                variant="primary"
                size="md"
                onClick={fetchOrders}
              >
                Refresh
              </Button>
            </div>
          ) : (
            <OrdersTable 
              orders={orders}
              onViewOrder={handleViewOrder}
              onEditOrder={handleEditOrder}
            />
          )}
        </div>
        
        <div className="content-footer">
          <span className="order-count">Total Orders: {ordersCounts.all || 0}</span>
          <Pagination 
            currentPage={page}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            isLastPage={orders.length < limit}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage; 