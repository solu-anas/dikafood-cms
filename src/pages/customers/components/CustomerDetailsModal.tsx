import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Card, 
  Space, 
  Row, 
  Col, 
  Tag, 
  Table, 
  Descriptions, 
  Avatar, 
  Statistic, 
  Spin, 
  Alert,
  Typography,
  Button,
  Timeline,
  message,
  Collapse,
  Divider
} from "antd";
import { 
  UserOutlined, 
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  CloseOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { formatMAD, getCustomerCart } from "../../../providers/dataProvider";
import { API_BASE_URL } from "../../../config/api";
import { Link } from "@refinedev/core";
import feedback from "../../../utils/feedback";
import { apiGet } from '../../../utils/api';

const { Title, Text } = Typography;

interface CustomerDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  customerId: string | null;
  customerInfo?: {
    fullName: string;
    email: string;
  };
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  visible,
  onClose,
  customerId,
  customerInfo
}) => {
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load customer details when modal opens
  useEffect(() => {
    if (visible && customerId) {
      fetchCustomerDetails();
    }
  }, [visible, customerId]);

  const fetchCustomerDetails = async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet(`${API_BASE_URL}/management/customers/${customerId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Type': 'DikaFood-CMS',
        },
        withCredentials: true,
      });
      setCustomerData(data.data);
    } catch (error: any) {
      console.error('Error fetching customer details:', error);
      message.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      verified: "success",
      unverified: "warning",
      suspended: "error",
      active: "success",
      customer: "default",
      manager: "blue",
      admin: "red",
    };
    return colors[status] || "default";
  };

  const handleClose = () => {
    setCustomerData(null);
    setError(null);
    onClose();
  };

  const getErrorMessage = (error: string | null): string => {
    return error || 'Failed to load customer details';
  };

  return (
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
            <EyeOutlined style={{ 
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
              Customer Details
            </div>
            {customerInfo && (
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.65)', 
                fontSize: '14px', 
                fontWeight: 400,
                lineHeight: '18px',
                marginTop: '2px'
              }}>
                {customerInfo.fullName} • {customerInfo.email}
              </div>
            )}
          </div>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={1000}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
      styles={{
        body: {
          padding: '16px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
    >
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          {...feedback.alertProps("error", "Error", error)}
          action={
            <Button size="small" onClick={fetchCustomerDetails}>
              Retry
            </Button>
          }
        />
      ) : customerData ? (
        <Row gutter={[24, 24]}>
          {/* Unified Customer Details */}
          <Col xs={24}>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                  {customerData.fullName || "N/A"}
                </Title>
                <Space>
                  <Tag style={{ color: 'rgba(255, 255, 255, 0.85)' }}>ID: {String(customerData.id || "").slice(-8) || "N/A"}</Tag>
                  <Tag color={customerData.isVerified ? 'success' : 'warning'} style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    {customerData.isVerified ? "Verified" : "Unverified"}
                  </Tag>
                  {customerData.isSuspended && (
                    <Tag color="error" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                      Suspended
                    </Tag>
                  )}
                </Space>
              </div>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    <Text copyable>{customerData.email || "N/A"}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Space>
                    <PhoneOutlined />
                    <Text>{customerData.countryCallingCode} {customerData.phoneNumber || "N/A"}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Registration">
                  <Space>
                    <CalendarOutlined />
                    {customerData.createdAt ? 
                      new Date(customerData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                      : "N/A"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Last Login">
                  <Space>
                    <UserOutlined />
                    <Text>{customerData.lastLoginRelative || 'Never'}</Text>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <Text type="secondary">No customer data available</Text>
        </div>
      )}
    </Modal>
  );
}; 