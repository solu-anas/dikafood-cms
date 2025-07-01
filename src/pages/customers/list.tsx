import React, { useState } from "react";
import {
  useTable,
  CreateButton,
} from "@refinedev/antd";
import { 
  Table, 
  Space, 
  Tag, 
  Typography, 
  Tooltip, 
  message, 
  Button, 
  Modal, 
  Spin, 
  Empty,
  Form,
  Select,
  Input,
  Switch,
  Radio,
  Dropdown,
  Menu,
  Alert
} from "antd";
import { 
  EyeOutlined, 
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  HistoryOutlined,
  CloseOutlined,
  UserDeleteOutlined,
  UserAddOutlined,
  WarningOutlined,
  MailOutlined,
  MoreOutlined,
  SendOutlined,
  LaptopOutlined,
  UserOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";
import { formatMAD, getEmailTemplates, sendCustomEmail, getCustomerSessions, getCustomerSessionStats, terminateCustomerSession } from "../../providers/dataProvider";
import { API_BASE_URL } from "../../config/api";
import { CustomerDetailsModal } from "./components/CustomerDetailsModal";
import { CustomerCartModal } from "./components/CustomerCartModal";
import CountryFlag from "../../components/CountryFlag";
import { getErrorMessage } from "../../utils/error";
import feedback from "../../utils/feedback";
import { apiGet, apiPost } from '../../utils/api';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Predefined suspension reasons
const SUSPENSION_REASONS = [
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'fraudulent_activity', label: 'Fraudulent Activity' },
  { value: 'payment_issues', label: 'Payment Issues' },
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
  { value: 'spam_abuse', label: 'Spam/Abuse' },
  { value: 'security_concerns', label: 'Security Concerns' },
  { value: 'multiple_violations', label: 'Multiple Violations' },
  { value: 'other', label: 'Other (Please specify)' }
];

// Truncated text component
const TruncatedText: React.FC<{ text: string; maxLength?: number; style?: React.CSSProperties; strong?: boolean; }> = ({ text, maxLength = 30, style, strong = false }) => {
  const truncated = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  
  if (text.length <= maxLength) {
    return <Text style={style} strong={strong}>{text}</Text>;
  }
  
  return (
    <Tooltip title={text}>
      <Text style={style} strong={strong}>{truncated}</Text>
    </Tooltip>
  );
};

// Order interface
interface Order {
  orderId: string;
  orderSerialNumber: number;
  orderStatus: string;
  paymentStatus: string;
  paymentType: string;
  deliveryStatus: string;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

// Customer orders data interface
interface CustomerOrdersData {
  customer: {
    customerId: string;
    fullName: string;
    email: string;
  };
  orders: Order[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

export const CustomerList = () => {
  const { tableProps, tableQueryResult } = useTable({
    resource: "customers",
    syncWithLocation: true,
  });
  const { isLoading, isError, error } = tableQueryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert {...feedback.alertProps("error", "Error", error)} />;

  const {
    dataSource,
    pagination,
  } = tableProps;

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<CustomerOrdersData | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [suspendingCustomers, setSuspendingCustomers] = useState<Set<string>>(new Set());

  // Suspension modal state
  const [suspensionModalVisible, setSuspensionModalVisible] = useState(false);
  const [selectedCustomerForSuspension, setSelectedCustomerForSuspension] = useState<any>(null);
  const [suspensionForm] = Form.useForm();
  const [suspensionLoading, setSuspensionLoading] = useState(false);

  // Email modal states
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedCustomerForEmail, setSelectedCustomerForEmail] = useState<any>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailForm] = Form.useForm();
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Sessions modal states
  const [sessionsModalVisible, setSessionsModalVisible] = useState(false);
  const [selectedCustomerForSessions, setSelectedCustomerForSessions] = useState<any>(null);
  const [sessionsData, setSessionsData] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [terminatingSessions, setTerminatingSessions] = useState<Set<string>>(new Set());

  // Status filter state
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Customer details modal state
  const [customerDetailsModalVisible, setCustomerDetailsModalVisible] = useState(false);
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState<any>(null);

  // Cart modal state
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [selectedCustomerForCart, setSelectedCustomerForCart] = useState<any>(null);

  // Status filter definitions
  const statusFilters = [
    {
      key: "all",
      label: "All",
      icon: <UserOutlined />,
      color: "#1890ff",
      bgColor: "rgba(24, 144, 255, 0.15)",
      borderColor: "rgba(24, 144, 255, 0.3)",
      count: dataSource?.length || 0
    },
    {
      key: "verified",
      label: "Verified",
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
      bgColor: "rgba(82, 196, 26, 0.15)",
      borderColor: "rgba(82, 196, 26, 0.3)",
      count: dataSource?.filter((customer: any) => customer.isVerified).length || 0
    },
    {
      key: "unverified",
      label: "Unverified",
      icon: <ExclamationCircleOutlined />,
      color: "#ff4d4f",
      bgColor: "rgba(255, 77, 79, 0.15)",
      borderColor: "rgba(255, 77, 79, 0.3)",
      count: dataSource?.filter((customer: any) => !customer.isVerified).length || 0
    },
    {
      key: "suspended",
      label: "Suspended",
      icon: <StopOutlined />,
      color: "#faad14",
      bgColor: "rgba(250, 173, 20, 0.15)",
      borderColor: "rgba(250, 173, 20, 0.3)",
      count: dataSource?.filter((customer: any) => customer.isSuspended).length || 0
    },
    {
      key: "active",
      label: "Active",
      icon: <UserAddOutlined />,
      color: "#13c2c2",
      bgColor: "rgba(19, 194, 194, 0.15)",
      borderColor: "rgba(19, 194, 194, 0.3)",
      count: dataSource?.filter((customer: any) => !customer.isSuspended).length || 0
    },
    {
      key: "with_orders",
      label: "With Orders",
      icon: <ShoppingCartOutlined />,
      color: "#722ed1",
      bgColor: "rgba(114, 46, 209, 0.15)",
      borderColor: "rgba(114, 46, 209, 0.3)",
      count: dataSource?.filter((customer: any) => customer.ordersCount > 0).length || 0
    },
    {
      key: "no_orders",
      label: "No Orders",
      icon: <HistoryOutlined />,
      color: "#8c8c8c",
      bgColor: "rgba(140, 140, 140, 0.15)",
      borderColor: "rgba(140, 140, 140, 0.3)",
      count: dataSource?.filter((customer: any) => customer.ordersCount === 0).length || 0
    }
  ];

  // Handle status filter change
  const handleStatusFilterChange = (statusKey: string) => {
    setActiveStatusFilter(statusKey);
    
    // Filter data based on status
    if (!dataSource) return;
    
    let filtered = [...dataSource];
    
    switch (statusKey) {
      case "verified":
        filtered = filtered.filter((customer: any) => customer.isVerified);
        break;
      case "unverified":
        filtered = filtered.filter((customer: any) => !customer.isVerified);
        break;
      case "suspended":
        filtered = filtered.filter((customer: any) => customer.isSuspended);
        break;
      case "active":
        filtered = filtered.filter((customer: any) => !customer.isSuspended);
        break;
      case "with_orders":
        filtered = filtered.filter((customer: any) => customer.ordersCount > 0);
        break;
      case "no_orders":
        filtered = filtered.filter((customer: any) => customer.ordersCount === 0);
        break;
      case "all":
      default:
        filtered = [...dataSource];
        break;
    }
    
    setFilteredData(filtered);
  };

  // Update filtered data when table data changes
  React.useEffect(() => {
    if (dataSource) {
      handleStatusFilterChange(activeStatusFilter);
    }
  }, [dataSource, activeStatusFilter]);

  // Create modified tableProps with filtered data
  const modifiedTableProps = {
    ...tableProps,
    dataSource: activeStatusFilter === "all" ? dataSource : filteredData,
    pagination: {
      ...pagination,
      total: activeStatusFilter === "all" ? dataSource?.length || 0 : filteredData.length,
    }
  };

  const fetchCustomerOrders = async (customerId: string, customerInfo: any) => {
    try {
      setLoadingOrders(true);
      setSelectedCustomer(customerInfo);
      setIsModalVisible(true);
      setOrdersData(null);

      const data = await apiGet(`${API_BASE_URL}/management/customers/${customerId}/orders`, {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Type': 'DikaFood-CMS',
        },
        withCredentials: true,
      });
      setOrdersData(data.data);
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      message.error('Failed to load customer orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCustomerSuspension = async (customerId: string, suspend: boolean, customerName: string) => {
    try {
      setSuspendingCustomers(prev => new Set(prev).add(customerId));
      
      const endpoint = suspend ? 'suspend' : 'activate';
      const data = await apiPost(`${API_BASE_URL}/management/customers/${customerId}/${endpoint}`, { customerId }, {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Type': 'DikaFood-CMS',
        },
        withCredentials: true,
      });
      if (data.success) {
        message.success(`${customerName} has been ${suspend ? 'suspended' : 'activated'} successfully`);
        window.location.reload();
      } else {
        throw new Error(data.error || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error updating customer suspension:', error);
      message.error(`Failed to ${suspend ? 'suspend' : 'activate'} customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSuspendingCustomers(prev => {
        const newSet = new Set(prev);
        newSet.delete(customerId);
        return newSet;
      });
    }
  };

  const handleSuspensionClick = (customer: any, suspend: boolean) => {
    if (suspend) {
      // For suspension, show the detailed modal
      setSelectedCustomerForSuspension(customer);
      setSuspensionModalVisible(true);
      suspensionForm.resetFields();
      suspensionForm.setFieldsValue({
        sendEmail: true, // Default to sending email
        reason: undefined,
        customReason: ''
      });
    } else {
      // For activation, use simple confirmation
      Modal.confirm({
        title: 'Activate Customer',
        content: `Are you sure you want to activate ${customer.fullName}?`,
        okText: 'Activate',
        okType: 'primary',
        cancelText: 'Cancel',
        onOk: () => handleCustomerSuspension(customer.id, false, customer.fullName),
      });
    }
  };

  const handleSuspensionSubmit = async (values: any) => {
    if (!selectedCustomerForSuspension) return;
    try {
      setSuspensionLoading(true);
      const requestBody = {
        customerId: selectedCustomerForSuspension.id,
        reason: values.reason,
        customReason: values.reason === 'other' ? values.customReason : undefined,
        sendEmail: values.sendEmail,
        additionalNotes: values.additionalNotes
      };
      const data = await apiPost(`${API_BASE_URL}/management/customers/${selectedCustomerForSuspension.id}/suspend`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Type': 'DikaFood-CMS',
        },
        withCredentials: true,
      });
      if (data.success) {
        message.success(`${selectedCustomerForSuspension.fullName} has been suspended successfully`);
        setSuspensionModalVisible(false);
        setSelectedCustomerForSuspension(null);
        suspensionForm.resetFields();
        window.location.reload();
      } else {
        throw new Error(data.error || 'Suspension failed');
      }
    } catch (error: any) {
      console.error('Error suspending customer:', error);
      message.error(`Failed to suspend customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSuspensionLoading(false);
    }
  };

  const handleSuspensionCancel = () => {
    setSuspensionModalVisible(false);
    setSelectedCustomerForSuspension(null);
    suspensionForm.resetFields();
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCustomer(null);
    setOrdersData(null);
  };

  // Email functions
  const fetchEmailTemplates = async () => {
    try {
      const result = await getEmailTemplates();
      if (result.success) {
        setEmailTemplates(result.data);
      } else {
        message.error('Failed to load email templates');
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
      message.error('Failed to load email templates');
    }
  };

  const handleSendEmailClick = (customer: any) => {
    setSelectedCustomerForEmail(customer);
    setEmailModalVisible(true);
    fetchEmailTemplates();
  };

  const handleEmailSubmit = async (values: any) => {
    if (!selectedCustomerForEmail) return;

    setEmailSending(true);
    try {
      const emailData = {
        subject: values.subject,
        templateId: values.templateId,
        templateData: values.templateData || {},
        customContent: values.customContent,
        senderName: values.senderName,
      };

      const result = await sendCustomEmail(selectedCustomerForEmail.id, emailData);
      
      if (result.success) {
        message.success(result.message || 'Email sent successfully');
        setEmailModalVisible(false);
        setSelectedCustomerForEmail(null);
        emailForm.resetFields();
        setSelectedTemplate(null);
      } else {
        message.error(result.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      message.error('Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleEmailCancel = () => {
    setEmailModalVisible(false);
    setSelectedCustomerForEmail(null);
    emailForm.resetFields();
    setSelectedTemplate(null);
  };

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    
    // Reset template-specific fields when template changes
    emailForm.setFieldsValue({
      templateData: {},
      customContent: undefined,
    });
  };

  // Session functions
  const fetchCustomerSessions = async (customerId: string, customerInfo: any) => {
    setSelectedCustomerForSessions(customerInfo);
    setSessionsModalVisible(true);
    setLoadingSessions(true);

    try {
      // Fetch both sessions and stats in parallel
      const [sessionsResult, statsResult] = await Promise.all([
        getCustomerSessions(customerId, { page: 1, limit: 10 }),
        getCustomerSessionStats(customerId)
      ]);

      if (sessionsResult.success) {
        setSessionsData(sessionsResult.data);
      } else {
        message.error('Failed to load customer sessions');
      }

      if (statsResult.success) {
        setSessionStats(statsResult.data);
      } else {
        message.error('Failed to load session statistics');
      }
    } catch (error) {
      console.error('Error fetching customer sessions:', error);
      message.error('Failed to load customer sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleViewSessionsClick = (customer: any) => {
    fetchCustomerSessions(customer.id, {
      fullName: customer.fullName,
      email: customer.email,
      customerId: customer.id
    });
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!selectedCustomerForSessions) return;

    setTerminatingSessions(prev => new Set(prev).add(sessionId));
    try {
      const result = await terminateCustomerSession(selectedCustomerForSessions.customerId, sessionId);
      
      if (result.success) {
        message.success('Session terminated successfully');
        // Refresh sessions data
        fetchCustomerSessions(selectedCustomerForSessions.customerId, selectedCustomerForSessions);
      } else {
        message.error(result.error || 'Failed to terminate session');
      }
    } catch (error: any) {
      console.error('Error terminating session:', error);
      message.error('Failed to terminate session');
    } finally {
      setTerminatingSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const handleCloseSessionsModal = () => {
    setSessionsModalVisible(false);
    setSelectedCustomerForSessions(null);
    setSessionsData(null);
    setSessionStats(null);
  };

  // Customer details functions
  const handleViewCustomerDetails = (customer: any) => {
    setSelectedCustomerForDetails(customer);
    setCustomerDetailsModalVisible(true);
  };

  const handleCloseCustomerDetailsModal = () => {
    setCustomerDetailsModalVisible(false);
    setSelectedCustomerForDetails(null);
  };

  // Cart functions
  const handleViewCart = (customer: any) => {
    setSelectedCustomerForCart(customer);
    setCartModalVisible(true);
  };

  const handleCloseCartModal = () => {
    setCartModalVisible(false);
    setSelectedCustomerForCart(null);
  };

  return (
    <>
      <style>{`
        /* Custom tag text color enforcement - same strategy as products page */
        .custom-tag-white-text,
        .custom-tag-white-text span,
        .custom-tag-white-text *,
        .ant-tag.custom-tag-white-text,
        .ant-tag.custom-tag-white-text span {
          color: #f0f0f0 !important;
        }
        
        .ant-table .ant-tag.custom-tag-white-text,
        .ant-table .ant-tag.custom-tag-white-text .ant-tag-text {
          color: #f0f0f0 !important;
        }
        
        .custom-tag-white-text.ant-tag {
          color: #f0f0f0 !important;
        }

        /* Hide the Ant Design measure row */
        .ant-table-measure-row {
          display: none !important;
        }

        /* Table cell separators with reduced height (50% height in center) */
        .ant-table-tbody > tr > td {
          position: relative;
        }

        .ant-table-tbody > tr > td::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          bottom: 25%;
          width: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        .ant-table-tbody > tr > td:last-child::after {
          display: none;
        }

        /* Simple header styling */
        .customers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24px;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .customers-title {
          font-size: 24px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          font-family: var(--font-body);
          margin: 0;
        }
      `}</style>
      
      <div 
        className="customers-header"
        style={{ flexDirection: "column", alignItems: "flex-start", gap: "16px" }}
      >
        <h1 className="customers-title">Customers</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {statusFilters.map((filter) => (
              <Button
                key={filter.key}
                type={activeStatusFilter === filter.key ? "default" : "default"}
                icon={filter.icon}
                className="icon-text-separator"
                onClick={() => handleStatusFilterChange(filter.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '36px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: activeStatusFilter === filter.key ? filter.bgColor : 'rgba(255, 255, 255, 0.05)',
                  borderColor: activeStatusFilter === filter.key ? filter.borderColor : 'rgba(255, 255, 255, 0.15)',
                  color: activeStatusFilter === filter.key ? filter.color : 'rgba(255, 255, 255, 0.75)',
                  transition: '0.2s',
                  boxShadow: activeStatusFilter === filter.key ? `0 0 0 2px ${filter.bgColor}` : 'none'
                }}
              >
                <span style={{ marginLeft: '6px' }}>{filter.label}</span>
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: activeStatusFilter === filter.key ? 'rgba(0,0,0,0.125)' : 'rgba(255,255,255,0.1)',
                  color: activeStatusFilter === filter.key ? filter.color : 'rgba(255,255,255,0.65)',
                  minWidth: '20px',
                  textAlign: 'center',
                  border: `1px solid ${activeStatusFilter === filter.key ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
                }}>
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
          <CreateButton />
        </div>
      </div>

      <Table
        {...tableProps}
        dataSource={activeStatusFilter === "all" ? dataSource : filteredData}
        rowKey="id"
        tableLayout="auto"
        size="middle"
        bordered={false}
        pagination={{
          ...pagination,
          showTotal: (total, range) => (
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {range[0]}-{range[1]} of {total} customers
            </span>
          ),
          pageSizeOptions: ["10", "20", "50", "100"],
          showSizeChanger: true,
          style: { fontFamily: 'var(--font-body)' }
        }}
      >
        <Table.Column
          title="#"
          dataIndex="serialNumber"
          width={100}
          render={(value) => <Text code>{value || "N/A"}</Text>}
        />

        <Table.Column
          title="Customer"
          dataIndex="fullName"
          width={280}
          render={(_, record: any) => (
              <div>
              <Text strong style={{ fontFamily: 'var(--font-body)' }}>{record.fullName || "N/A"}</Text>
              <div style={{ marginTop: '8px' }}>
                <Space>
                  <Tag
                    className="custom-tag-white-text"
                    icon={record.isVerified ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      backgroundColor: record.isVerified ? 'rgba(45, 134, 93, 0.15)' : 'rgba(232, 70, 70, 0.15)',
                      borderColor: record.isVerified ? 'rgba(45, 134, 93, 0.3)' : 'rgba(232, 70, 70, 0.3)',
                      color: '#f0f0f0'
                    }}
                  >
                    {record.isVerified ? "Verified" : "Unverified"}
                  </Tag>
                  {record.isSuspended && (
                    <Tag
                      className="custom-tag-white-text"
                      color="warning"
                      icon={<StopOutlined />}
                      style={{ 
                        fontFamily: 'var(--font-body)', 
                        fontWeight: 500
                      }}
                    >
                      Suspended
                    </Tag>
                  )}
            </Space>
              </div>
            </div>
          )}
        />

        <Table.Column
          title="Email"
          dataIndex="email"
          width={280}
          render={(value: string, record: any) => (
            <div>
              <div style={{ marginBottom: '8px' }}>
                <TruncatedText text={value || "N/A"} maxLength={30} />
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '4px 6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Tooltip title="Copy Email">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(value);
                        message.success('Email copied to clipboard');
                      }}
                      style={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        border: 'none',
                        background: 'transparent',
                        padding: '4px',
                        minWidth: 'auto',
                        height: 'auto'
                      }}
                    />
                  </Tooltip>
                  <div style={{ 
                    width: '1px', 
                    height: '16px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                  }} />
                  <Tooltip title="Send Email">
                    <Button
                      type="text"
                      size="small"
                      icon={<SendOutlined />}
                      onClick={() => handleSendEmailClick(record)}
                      style={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        border: 'none',
                        background: 'transparent',
                        padding: '4px',
                        minWidth: 'auto',
                        height: 'auto'
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
        />

        <Table.Column
          title="Phone Number"
          dataIndex="phoneNumber"
          width={180}
          render={(_, record: any) => (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {record.country && (
                <CountryFlag countryCode={record.country} size="small" />
              )}
              <span style={{ color: '#888', fontWeight: 500 }}>
                {record.countryCallingCode || ''}
              </span>
              <span>{record.phoneNumber || "N/A"}</span>
            </span>
          )}
        />

        <Table.Column
          title="Orders"
          dataIndex="ordersCount"
          width={120}
          render={(value: number, record: any) => (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <Tag
                className="custom-tag-white-text"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  backgroundColor: value > 0 ? 'rgba(61, 136, 207, 0.15)' : 'rgba(140, 140, 140, 0.15)',
                  borderColor: value > 0 ? 'rgba(61, 136, 207, 0.3)' : 'rgba(140, 140, 140, 0.3)',
                  color: '#f0f0f0'
                }}
              >
                {value || 0}
              </Tag>
              {value > 0 && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '4px 6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Tooltip title="View Order History">
                    <Button
                      type="text"
                      size="small"
                      icon={<HistoryOutlined />}
                      onClick={() => {
                        if (record && record.id) {
                          fetchCustomerOrders(record.id, {
                            fullName: record.fullName,
                            email: record.email,
                            ordersCount: record.ordersCount
                          });
                        } else {
                          console.error("Customer ID is missing", record);
                          message.error("Cannot fetch orders: Customer ID is missing.");
                        }
                      }}
                      style={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        border: 'none',
                        background: 'transparent',
                        padding: '4px',
                        minWidth: 'auto',
                        height: 'auto'
                      }}
                    />
                  </Tooltip>
                </div>
              )}
            </div>
          )}
        />

        <Table.Column
          title="Last Login"
          dataIndex="lastLoginRelative"
          width={180}
          render={(value: string) => <Text>{value || "Never"}</Text>}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          width={180}
          render={(_, record: any) => {
            const isLoading = suspendingCustomers.has(record.id);
            const isSuspended = record.isSuspended;
            
            // Create more actions menu
            const moreActionsMenu = (
              <Menu
                style={{
                  backgroundColor: 'rgba(45, 45, 45, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  minWidth: '160px'
                }}
              >
                <Menu.Item
                  key="sendEmail"
                  icon={<SendOutlined />}
                  onClick={() => handleSendEmailClick(record)}
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)'
                  }}
                  className="icon-text-separator"
                >
                  Send Email
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  key="viewSessions"
                  icon={<LaptopOutlined />}
                  onClick={() => handleViewSessionsClick(record)}
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)'
                  }}
                  className="icon-text-separator"
                >
                  View Sessions
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  key="suspend"
                  icon={isSuspended ? <UserAddOutlined /> : <UserDeleteOutlined />}
                  onClick={() => handleSuspensionClick(record, !isSuspended)}
                  style={{
                    color: isSuspended ? 'rgba(82, 196, 26, 0.85)' : 'rgba(255, 77, 79, 0.85)'
                  }}
                  className="icon-text-separator"
                >
                  {isSuspended ? 'Activate Customer' : 'Suspend Customer'}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  key="delete"
                  icon={<StopOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Delete Customer',
                      content: `Are you sure you want to delete ${record.fullName}? This action cannot be undone.`,
                      okText: 'Delete',
                      okType: 'danger',
                      cancelText: 'Cancel',
                      onOk: () => {
                        message.info('Delete functionality not implemented yet');
                      },
                    });
                  }}
                  style={{
                    color: 'rgba(255, 77, 79, 0.85)'
                  }}
                  className="icon-text-separator"
                >
                  Delete Customer
                </Menu.Item>
              </Menu>
            );
            
            return (
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start',
                gap: '4px',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Tooltip title="View Details">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewCustomerDetails(record)}
                    style={{
                      color: 'rgba(255, 255, 255, 0.65)',
                      border: 'none',
                      background: 'transparent',
                      padding: '4px',
                      minWidth: 'auto',
                      height: 'auto'
                    }}
                  />
                </Tooltip>
                <div style={{ 
                  width: '1px', 
                  height: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                }} />
                <Tooltip title="View Order History">
                  <Button
                    type="text"
                    size="small"
                    icon={<HistoryOutlined />}
                    onClick={() => {
                      if (record && record.id) {
                        fetchCustomerOrders(record.id, {
                          fullName: record.fullName,
                          email: record.email,
                          ordersCount: record.ordersCount
                        });
                      } else {
                        console.error("Customer ID is missing", record);
                        message.error("Cannot fetch orders: Customer ID is missing.");
                      }
                    }}
                    style={{
                      color: 'rgba(255, 255, 255, 0.65)',
                      border: 'none',
                      background: 'transparent',
                      padding: '4px',
                      minWidth: 'auto',
                      height: 'auto'
                    }}
                  />
                </Tooltip>
                <div style={{ 
                  width: '1px', 
                  height: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                }} />
                <Tooltip title="View Cart">
                  <Button
                    type="text"
                    size="small"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => handleViewCart(record)}
                    style={{
                      color: 'rgba(255, 255, 255, 0.65)',
                      border: 'none',
                      background: 'transparent',
                      padding: '4px',
                      minWidth: 'auto',
                      height: 'auto'
                    }}
                  />
                </Tooltip>
                <div style={{ 
                  width: '1px', 
                  height: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                }} />
                <Dropdown
                  overlay={moreActionsMenu}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    style={{
                      color: 'rgba(255, 255, 255, 0.65)',
                      border: 'none',
                      background: 'transparent',
                      padding: '4px',
                      minWidth: 'auto',
                      height: 'auto'
                    }}
                  />
                </Dropdown>
              </div>
            );
          }}
        />
      </Table>

      {/* Customer Orders Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            margin: '-20px -24px 0 -24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              borderRight: '1px solid rgba(255, 255, 255, 0.15)',
              paddingRight: '16px'
            }}>
              <HistoryOutlined style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '18px' 
              }} />
            </div>
            <div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '18px', 
                fontWeight: 500,
                lineHeight: '22px'
              }}>
                Order History
              </div>
              {selectedCustomer && (
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.65)', 
                  fontSize: '14px', 
                  fontWeight: 400,
                  lineHeight: '18px',
                  marginTop: '2px'
                }}>
                  {selectedCustomer.fullName} • {selectedCustomer.email}
                </div>
              )}
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={1000}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
        styles={{
          body: {
            padding: '24px',
            minHeight: '400px'
          }
        }}
      >
        {loadingOrders ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" />
          </div>
        ) : ordersData && ordersData.orders.length > 0 ? (
          <Table
            dataSource={ordersData.orders}
            rowKey="orderId"
            pagination={{
              total: ordersData.pagination.total,
              pageSize: ordersData.pagination.limit,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            scroll={{ x: 800 }}
            size="small"
          >
            <Table.Column
              title="Order #"
              dataIndex="orderSerialNumber"
              key="orderSerialNumber"
              width={100}
              render={(value: number) => <Text code>#{value}</Text>}
            />
            <Table.Column
          title="Status"
              dataIndex="orderStatus"
              key="orderStatus"
              width={100}
              render={(value: string) => {
                const color = value === 'confirmed' ? 'success' : 
                             value === 'cancelled' ? 'error' : 'processing';
                return <Tag color={color}>{value?.toUpperCase()}</Tag>;
              }}
            />
            <Table.Column
              title="Payment"
              dataIndex="paymentStatus"
              key="paymentStatus"
              width={120}
              render={(value: string, record: Order) => (
                <div>
                  <Tag 
                    color={value === 'paid' ? 'success' : value === 'cancelled' ? 'error' : 'warning'}
                  >
                    {value?.toUpperCase()}
                  </Tag>
                  <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
                    {record.paymentType}
                  </div>
                </div>
              )}
            />
            <Table.Column
              title="Delivery"
              dataIndex="deliveryStatus"
              key="deliveryStatus"
              width={100}
              render={(value: string) => {
                const color = value === 'delivered' ? 'success' : 
                             value === 'cancelled' ? 'error' : 'processing';
                return <Tag color={color}>{value?.toUpperCase()}</Tag>;
              }}
            />
            <Table.Column
              title="Items"
              dataIndex="itemsCount"
              key="itemsCount"
              width={70}
              render={(value: number) => <Text>{value}</Text>}
            />
            <Table.Column
              title="Total"
              dataIndex="totalAmount"
              key="totalAmount"
              width={100}
              render={(value: number) => <Text strong>{formatMAD(value)}</Text>}
            />
            <Table.Column
              title="Created"
              dataIndex="createdAt"
              key="createdAt"
              width={120}
              render={(value: string) => <Text style={{ fontSize: '12px' }}>{value}</Text>}
            />
          </Table>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px',
            textAlign: 'center'
          }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '16px', marginBottom: '8px' }}>
                    No Orders Found
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '14px' }}>
                    This customer hasn't placed any orders yet.
                  </div>
                </div>
              }
            />
          </div>
        )}
      </Modal>

      {/* Suspension Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            margin: '-20px -24px 0 -24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              borderRight: '1px solid rgba(255, 255, 255, 0.15)',
              paddingRight: '16px'
            }}>
              <WarningOutlined style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '18px' 
              }} />
            </div>
            <div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '18px', 
                fontWeight: 500,
                lineHeight: '22px'
              }}>
                Suspend Customer
              </div>
              {selectedCustomerForSuspension && (
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.65)', 
                  fontSize: '14px', 
                  fontWeight: 400,
                  lineHeight: '18px',
                  marginTop: '2px'
                }}>
                  {selectedCustomerForSuspension.fullName} • {selectedCustomerForSuspension.email}
                </div>
              )}
            </div>
          </div>
        }
        open={suspensionModalVisible}
        onCancel={handleSuspensionCancel}
        footer={null}
        width={600}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
        styles={{
          body: {
            padding: '24px',
            minHeight: '400px'
          }
        }}
      >
        {suspensionLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px' 
          }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={suspensionForm}
            onFinish={handleSuspensionSubmit}
            layout="vertical"
            style={{ color: 'rgba(255, 255, 255, 0.85)' }}
          >
            <Form.Item
              name="reason"
              label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Suspension Reason</span>}
              rules={[{ required: true, message: 'Please select a reason for suspension' }]}
              style={{ marginBottom: '20px' }}
            >
              <Select
                placeholder="Select a reason"
                style={{ width: '100%' }}
              >
                {SUSPENSION_REASONS.map(reason => (
                  <Option key={reason.value} value={reason.value}>
                    {reason.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.reason !== currentValues.reason}
            >
              {({ getFieldValue }) =>
                getFieldValue('reason') === 'other' ? (
                  <Form.Item
                    name="customReason"
                    label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Please specify the reason</span>}
                    rules={[{ required: true, message: 'Please specify the custom reason' }]}
                    style={{ marginBottom: '20px' }}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Please provide details about the suspension reason..."
                      style={{ resize: 'none' }}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item
              name="additionalNotes"
              label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Additional Notes (Optional)</span>}
              style={{ marginBottom: '20px' }}
            >
              <TextArea
                rows={3}
                placeholder="Any additional information or context..."
                style={{ resize: 'none' }}
              />
            </Form.Item>

            <Form.Item
              name="sendEmail"
              valuePropName="checked"
              style={{ marginBottom: '24px' }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <MailOutlined style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '16px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500, marginBottom: '4px' }}>
                    Send Notification Email
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12px' }}>
                    Notify the customer about the account suspension
                  </div>
                </div>
                <Switch />
              </div>
            </Form.Item>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Button 
                onClick={handleSuspensionCancel}
                style={{ minWidth: '100px' }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                danger
                htmlType="submit" 
                loading={suspensionLoading}
                style={{ minWidth: '120px' }}
              >
                Suspend Customer
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* Email Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            margin: '-20px -24px 0 -24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              borderRight: '1px solid rgba(255, 255, 255, 0.15)',
              paddingRight: '16px'
            }}>
              <SendOutlined style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '18px' 
              }} />
            </div>
            <div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '18px', 
                fontWeight: 500,
                lineHeight: '22px'
              }}>
                Send Email
              </div>
              {selectedCustomerForEmail && (
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.65)', 
                  fontSize: '14px', 
                  fontWeight: 400,
                  lineHeight: '18px',
                  marginTop: '2px'
                }}>
                  To: {selectedCustomerForEmail.fullName} • {selectedCustomerForEmail.email}
                </div>
              )}
            </div>
          </div>
        }
        open={emailModalVisible}
        onCancel={handleEmailCancel}
        footer={null}
        width={800}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
        styles={{
          body: {
            padding: '24px',
            minHeight: '500px'
          }
        }}
      >
        {emailSending ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            gap: '16px'
          }}>
            <Spin size="large" />
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '16px' }}>
              Sending email...
            </div>
          </div>
        ) : (
          <Form
            form={emailForm}
            onFinish={handleEmailSubmit}
            layout="vertical"
            style={{ color: 'rgba(255, 255, 255, 0.85)' }}
          >
            <Form.Item
              name="subject"
              label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Subject</span>}
              rules={[{ required: true, message: 'Please enter email subject' }]}
              style={{ marginBottom: '20px' }}
            >
              <Input
                placeholder="Enter email subject..."
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="templateId"
              label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Email Template</span>}
              rules={[{ required: true, message: 'Please select an email template' }]}
              style={{ marginBottom: '20px' }}
            >
              <Select
                placeholder="Select an email template"
                style={{ width: '100%' }}
                onChange={handleTemplateChange}
              >
                {emailTemplates.map(template => (
                  <Option key={template.id} value={template.id}>
                    <div style={{ lineHeight: '1.4' }}>
                      <div style={{ 
                        fontWeight: 500, 
                        color: 'rgba(255, 255, 255, 0.85)',
                        marginBottom: '2px'
                      }}>
                        {template.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'rgba(255, 255, 255, 0.55)',
                        lineHeight: '1.3'
                      }}>
                        {template.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedTemplate && selectedTemplate.id === 'custom' && (
              <Form.Item
                name="customContent"
                label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Message Content</span>}
                rules={[{ required: true, message: 'Please enter your message' }]}
                style={{ marginBottom: '20px' }}
              >
                <TextArea
                  rows={8}
                  placeholder="Enter your custom message here..."
                  style={{ resize: 'vertical' }}
                />
              </Form.Item>
            )}

            {selectedTemplate && selectedTemplate.id === 'special_offer' && (
              <>
                <Form.Item
                  name={['templateData', 'offerTitle']}
                  label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Offer Title</span>}
                  rules={[{ required: true, message: 'Please enter offer title' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input placeholder="e.g., 20% Off All Products" />
                </Form.Item>

                <Form.Item
                  name={['templateData', 'offerDescription']}
                  label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Offer Description</span>}
                  rules={[{ required: true, message: 'Please enter offer description' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <TextArea
                    rows={3}
                    placeholder="Describe the special offer..."
                    style={{ resize: 'none' }}
                  />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <Form.Item
                    name={['templateData', 'discountCode']}
                    label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Discount Code (Optional)</span>}
                  >
                    <Input placeholder="e.g., SAVE20" />
                  </Form.Item>

                  <Form.Item
                    name={['templateData', 'validUntil']}
                    label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Valid Until (Optional)</span>}
                  >
                    <Input placeholder="e.g., 31 December 2024" />
                  </Form.Item>
                </div>
              </>
            )}

            {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && selectedTemplate.id !== 'custom' && selectedTemplate.id !== 'special_offer' && (
              <div style={{ 
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '20px'
              }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500, marginBottom: '12px' }}>
                  Template Variables
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '14px' }}>
                  Available variables: {selectedTemplate.variables.join(', ')}
                </div>
              </div>
            )}

            <Form.Item
              name="senderName"
              label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Sender Name (Optional)</span>}
              style={{ marginBottom: '24px' }}
            >
              <Input
                placeholder="e.g., John from DikaFood Team"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Button 
                onClick={handleEmailCancel}
                style={{ minWidth: '100px' }}
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit" 
                loading={emailSending}
                icon={<SendOutlined />}
                style={{ minWidth: '120px' }}
                className="icon-text-separator"
              >
                Send Email
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* Customer Sessions Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '8px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '16px',
            paddingBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              border: '1px solid rgba(24, 144, 255, 0.2)'
            }}>
              <LaptopOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '18px', 
                fontWeight: 600,
                lineHeight: '24px'
              }}>
                Customer Sessions
              </div>
              {selectedCustomerForSessions && (
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.65)', 
                  fontSize: '14px', 
                  fontWeight: 400,
                  lineHeight: '18px',
                  marginTop: '2px'
                }}>
                  {selectedCustomerForSessions.fullName} • {selectedCustomerForSessions.email}
                </div>
              )}
            </div>
          </div>
        }
        open={sessionsModalVisible}
        onCancel={handleCloseSessionsModal}
        footer={null}
        width={1000}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
        styles={{
          body: {
            padding: '24px',
            minHeight: '600px'
          }
        }}
      >
        {loadingSessions ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            gap: '16px'
          }}>
            <Spin size="large" />
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '16px' }}>
              Loading sessions...
            </div>
          </div>
        ) : (
          <div>
            {/* Session Statistics */}
            {sessionStats && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  fontSize: '16px', 
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  Session Overview
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ 
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '14px' }}>
                      Total Sessions
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '24px', fontWeight: 600 }}>
                      {sessionStats.stats.totalSessions}
                    </div>
                  </div>
                  <div style={{ 
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '14px' }}>
                      Active Sessions
                    </div>
                    <div style={{ color: '#52c41a', fontSize: '24px', fontWeight: 600 }}>
                      {sessionStats.stats.activeSessions}
                    </div>
                  </div>
                  <div style={{ 
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '14px' }}>
                      Inactive Sessions
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '24px', fontWeight: 600 }}>
                      {sessionStats.stats.inactiveSessions}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions Table */}
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.85)', 
              fontSize: '16px', 
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              Recent Sessions
            </div>
            
            {sessionsData && sessionsData.sessions && sessionsData.sessions.length > 0 ? (
              <div style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden'
              }}>
                <Table
                  dataSource={sessionsData.sessions}
                  rowKey="sessionId"
                  pagination={false}
                size="small"
                  scroll={{ x: 800 }}
                  style={{ 
                    backgroundColor: 'transparent',
                  }}
                  columns={[
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      width: 100,
                      render: (status: string, record: any) => (
                        <Tag 
                          color={record.isActive ? 'green' : 'default'}
                          style={{ 
                            color: record.isActive ? '#52c41a' : 'rgba(255, 255, 255, 0.45)',
                            backgroundColor: record.isActive ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${record.isActive ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '4px'
                          }}
                        >
                          {status}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Device & Browser',
                      key: 'device',
                      width: 200,
                      render: (record: any) => (
                        <div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px' }}>
                            {record.browser}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '12px' }}>
                            {record.os}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: 'Location',
                      key: 'location',
                      width: 150,
                      render: (record: any) => (
                        <div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px' }}>
                            {record.location.city}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '12px' }}>
                            {record.location.country}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: 'IP Address',
                      dataIndex: 'ipAddress',
                      key: 'ipAddress',
                      width: 120,
                      render: (ip: string) => (
                        <code style={{ 
                          color: 'rgba(255, 255, 255, 0.65)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {ip}
                        </code>
                      ),
                    },
                    {
                      title: 'First Login',
                      dataIndex: 'firstLogin',
                      key: 'firstLogin',
                      width: 140,
                      render: (date: string) => (
                        <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12px' }}>
                          {new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
                        </div>
                      ),
                    },
                    {
                      title: 'Last Accessed',
                      dataIndex: 'lastAccessed',
                      key: 'lastAccessed',
                      width: 140,
                      render: (date: string) => (
                        <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12px' }}>
                          {new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
                        </div>
                      ),
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      width: 100,
                      render: (record: any) => (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {record.isActive && (
                            <Button
                              type="text"
                size="small"
                              danger
                              icon={<StopOutlined />}
                              loading={terminatingSessions.has(record.sessionId)}
                              onClick={() => {
                                Modal.confirm({
                                  title: 'Terminate Session',
                                  content: 'Are you sure you want to terminate this session? The user will be logged out.',
                                  okText: 'Terminate',
                                  okType: 'danger',
                                  cancelText: 'Cancel',
                                  onOk: () => handleTerminateSession(record.sessionId),
                                });
                              }}
                              style={{ 
                                color: '#ff4d4f',
                                borderColor: 'rgba(255, 77, 79, 0.2)'
                              }}
                              className="icon-text-separator"
                            >
                              Terminate
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: 'rgba(255, 255, 255, 0.45)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <LaptopOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>No Sessions Found</div>
                <div style={{ fontSize: '14px' }}>This customer has no active or recent sessions.</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        visible={customerDetailsModalVisible}
        onClose={handleCloseCustomerDetailsModal}
        customerId={selectedCustomerForDetails?.id || null}
        customerInfo={selectedCustomerForDetails ? {
          fullName: selectedCustomerForDetails.fullName,
          email: selectedCustomerForDetails.email
        } : undefined}
      />

      <CustomerCartModal
        visible={cartModalVisible}
        onClose={handleCloseCartModal}
        customerId={selectedCustomerForCart?.id || null}
        customerInfo={selectedCustomerForCart ? {
          fullName: selectedCustomerForCart.fullName,
          email: selectedCustomerForCart.email
        } : undefined}
      />
    </>
  );
};