import React from "react";
import { useShow } from "@refinedev/core";
import {
  Show,
  NumberField,
  TagField,
  EmailField,
  TextField,
  DateField,
} from "@refinedev/antd";
import { Typography, Card, Space, Divider, Row, Col, Tag, Table, Button, Timeline, Descriptions, Alert, Spin } from "antd";
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  TruckOutlined, 
  CreditCardOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { formatMAD } from "../../providers/dataProvider";
import { getErrorMessage } from "../../utils/error";

const { Title, Text } = Typography;

export const OrderShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading, isError, error } = queryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert message="Error" description={getErrorMessage(error)} type="error" showIcon />;

  const record = data?.data;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "orange",
      confirmed: "blue", 
      preparing: "cyan",
      ready: "green",
      delivering: "purple",
      delivered: "success",
      cancelled: "error",
      completed: "success",
      failed: "error",
      refunded: "purple",
    };
    return colors[status] || "default";
  };

  const orderItems = record?.data?.items || [];
  const contacts = record?.data?.contacts?.[0] || {};
  const delivery = record?.data?.delivery || {};
  const payment = record?.data?.payment || {};
  const totals = record?.data?.totalAmount || {};

  const itemColumns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, item: any) => (
        <div>
          <Text strong>{item.productName || item.name || "Unknown Product"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Variant: {item.variantName || item.variant || "Default"}
          </Text>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => <Text>{quantity || 1}</Text>,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice", 
      render: (price: number) => (
        <Text strong>{price ? formatMAD(price) : "N/A"}</Text>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total: number, item: any) => {
        const itemTotal = total || (item.unitPrice * item.quantity) || 0;
        return <Text strong style={{ color: "#1890ff" }}>{formatMAD(itemTotal)}</Text>;
      },
    },
  ];

  if (isLoading) {
    return <Show isLoading={isLoading} />;
  }

  return (
    <Show>
      <Row gutter={[16, 16]}>
        {/* Order Summary */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined />
                Order Summary
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Order ID">
                <Text code>{record?.id ? String(record.id).slice(-8) : "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(record?.orderStatus)}>
                  {record?.orderStatus?.toUpperCase() || "UNKNOWN"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                <Space>
                  <CalendarOutlined />
                  {record?.formattedCreatedAt || "N/A"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  {record?.formattedTotal || formatMAD(totals.items || 0)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Customer Information */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <UserOutlined />
                Customer Information
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">
                <Text strong>{record?.customerName || `${contacts.firstName} ${contacts.lastName}` || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space>
                  <EmailField value={record?.customerEmail || contacts.email || "N/A"} />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <Space>
                  <PhoneOutlined />
                  <Text>{contacts.phone || "N/A"}</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Payment Information */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <CreditCardOutlined />
                Payment Information
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Payment Status">
                <Tag color={getStatusColor(record?.paymentStatus || payment.status)}>
                  {(record?.paymentStatus || payment.status)?.toUpperCase() || "UNKNOWN"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Text>{payment.method || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Transaction ID">
                <Text code style={{ fontSize: "12px" }}>
                  {payment.transactionId ? String(payment.transactionId).slice(-8) : "N/A"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Delivery Information */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TruckOutlined />
                Delivery Information
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Delivery Status">
                <Tag color={getStatusColor(delivery.status)}>
                  {delivery.status?.toUpperCase() || "UNKNOWN"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Method">
                <Text>{delivery.method || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Space>
                  <EnvironmentOutlined />
                  <div>
                    <Text>{delivery.location?.address || "N/A"}</Text>
                    <br />
                    <Text type="secondary">
                      {delivery.location?.city || "N/A"}, {delivery.location?.country || "N/A"}
                    </Text>
                  </div>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Fee">
                <Text strong>{delivery.fee ? formatMAD(delivery.fee) : "Free"}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Order Totals */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <DollarOutlined />
                Order Totals
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Subtotal">
                <Text>{formatMAD(totals.items || 0)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Fee">
                <Text>{formatMAD(totals.delivery || 0)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tax">
                <Text>{formatMAD(totals.tax || 0)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                <Text style={{ color: "green" }}>
                  -{formatMAD(totals.discount || 0)}
                </Text>
              </Descriptions.Item>
              <Divider style={{ margin: "8px 0" }} />
              <Descriptions.Item label="Total">
                <Text strong style={{ fontSize: "18px", color: "#1890ff" }}>
                  {formatMAD(totals.final || totals.items || 0)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Order Items */}
        <Col xs={24}>
          <Card title="Order Items">
            <Table
              dataSource={orderItems}
              columns={itemColumns}
              rowKey={(item) => item.id || item.productId || Math.random()}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Order Timeline */}
        <Col xs={24}>
          <Card title="Order Timeline">
            <Timeline
              items={[
                {
                  children: `Order created - ${record?.formattedCreatedAt}`,
                  color: 'blue',
                },
                {
                  children: `Payment ${record?.paymentStatus || 'pending'}`,
                  color: getStatusColor(record?.paymentStatus),
                },
                {
                  children: `Order ${record?.orderStatus || 'pending'}`, 
                  color: getStatusColor(record?.orderStatus),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Show>
  );
}; 