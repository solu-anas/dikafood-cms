import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Table, Typography, Tag, Card, Spin, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { formatMAD } from "../../providers/dataProvider";
import { API_BASE_URL } from "../../config/api";

const { Title, Text } = Typography;

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

export const CustomerOrders: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerOrdersData | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomerOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/management/customers/${customerId}/orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customer orders');
        }

        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        message.error('Failed to load customer orders');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerOrders();
  }, [customerId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>No data available</Text>
      </div>
    );
  }

  const columns = [
    {
      title: "Order #",
      dataIndex: "orderSerialNumber",
      key: "orderSerialNumber",
      width: 120,
      render: (value: number) => <Text code>#{value}</Text>,
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 120,
      render: (value: string) => {
        const color = value === 'confirmed' ? 'success' : 
                     value === 'cancelled' ? 'error' : 'processing';
        return <Tag color={color}>{value?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 120,
      render: (value: string, record: Order) => (
        <div>
          <Tag color={value === 'paid' ? 'success' : value === 'cancelled' ? 'error' : 'warning'}>
            {value?.toUpperCase()}
          </Tag>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            {record.paymentType}
          </div>
        </div>
      ),
    },
    {
      title: "Delivery",
      dataIndex: "deliveryStatus",
      key: "deliveryStatus",
      width: 120,
      render: (value: string) => {
        const color = value === 'delivered' ? 'success' : 
                     value === 'cancelled' ? 'error' : 'processing';
        return <Tag color={color}>{value?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Items",
      dataIndex: "itemsCount",
      key: "itemsCount",
      width: 80,
      render: (value: number) => <Text>{value}</Text>,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (value: number) => <Text strong>{formatMAD(value)}</Text>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (value: string) => <Text>{value}</Text>,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <ArrowLeftOutlined 
            style={{ 
              fontSize: '16px', 
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.65)'
            }}
            onClick={() => window.close()}
          />
          <Title level={2} style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)' }}>
            Order History
          </Title>
        </div>
        
        <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div>
              <Text strong style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                {data.customer.fullName}
              </Text>
              <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
                {data.customer.email}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Total Orders: <Text strong style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  {data.pagination.total}
                </Text>
              </Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <Table
          dataSource={data.orders}
          columns={columns}
          rowKey="orderId"
          pagination={{
            total: data.pagination.total,
            pageSize: data.pagination.limit,
            current: Math.floor(data.pagination.skip / data.pagination.limit) + 1,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}; 