import { useState } from "react";
import { PiMagnifyingGlassDuotone, PiFunnelDuotone, PiPlusDuotone } from "react-icons/pi";
import Button from "../../../../components/ui/Button";
import "./styles.scss";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Sample customers data - would normally come from API
  const sampleCustomers = [
    { 
      id: "CUS-001", 
      name: "John Doe", 
      email: "john.doe@example.com", 
      phone: "+1 (555) 123-4567", 
      orders: 5, 
      totalSpent: "$435.25",
      status: "active"
    },
    { 
      id: "CUS-002", 
      name: "Jane Smith", 
      email: "jane.smith@example.com", 
      phone: "+1 (555) 987-6543", 
      orders: 2, 
      totalSpent: "$128.50",
      status: "active"
    },
    { 
      id: "CUS-003", 
      name: "Robert Johnson", 
      email: "robert.j@example.com", 
      phone: "+1 (555) 456-7890", 
      orders: 0, 
      totalSpent: "$0.00",
      status: "inactive"
    }
  ];

  const loadCustomers = () => {
    // This would be an API call in a real app
    setCustomers(sampleCustomers);
  };

  return (
    <div className="customers-page">
      <div className="content-container">
        <div className="content-header">
          <h1>Customers</h1>
          <p>Manage your customer database</p>
        </div>
        
        <div className="content-body">
          <div className="header-actions">
            <div className="search-container">
              <PiMagnifyingGlassDuotone size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Button
              variant="secondary"
              icon={<PiFunnelDuotone size={18} />}
            >
              Filter
            </Button>
            <Button
              variant="primary"
              icon={<PiPlusDuotone size={18} />}
            >
              Add Customer
            </Button>
          </div>

          {customers.length === 0 ? (
            <div className="empty-state">
              <p>No customers found</p>
              <Button
                variant="primary"
                size="md"
                onClick={loadCustomers}
              >
                Load Sample Customers
              </Button>
            </div>
          ) : (
            <div className="table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.orders}</td>
                      <td>{customer.totalSpent}</td>
                      <td>
                        <span className={`status-badge status-${customer.status}`}>
                          {customer.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Button variant="text" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="content-footer">
          <Button 
            variant="text" 
            size="sm"
            onClick={loadCustomers}
          >
            Refresh Data
          </Button>
          {customers.length > 0 && (
            <span className="customer-count">Showing {customers.length} customers</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage; 