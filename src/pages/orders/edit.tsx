import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Card, Row, Col, Space, Typography, Tag, Descriptions } from "antd";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  TruckOutlined, 
  CreditCardOutlined 
} from "@ant-design/icons";
import { formatMAD } from "../../providers/dataProvider";

const { Title, Text } = Typography;
const { Option } = Select;

export const OrderEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const orderData = queryResult?.data?.data;

  const orderStatusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready", value: "ready" },
    { label: "Delivering", value: "delivering" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const paymentStatusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const deliveryStatusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "In Transit", value: "in_transit" },
    { label: "Out for Delivery", value: "out_for_delivery" },
    { label: "Delivered", value: "delivered" },
    { label: "Failed", value: "failed" },
    { label: "Returned", value: "returned" },
  ];

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
      in_transit: "blue",
      out_for_delivery: "purple",
      returned: "warning",
    };
    return colors[status] || "default";
  };

  const contacts = orderData?.data?.contacts?.[0] || {};
  const delivery = orderData?.data?.delivery || {};
  const payment = orderData?.data?.payment || {};
  const totals = orderData?.data?.totalAmount || {};

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Row gutter={[16, 16]}>
        {/* Order Information (Read-only) */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined />
                Order Information
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Order ID">
                <Text code>{orderData?.id ? String(orderData.id).slice(-8) : "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                <Text strong>{orderData?.customerName || `${contacts.firstName} ${contacts.lastName}` || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text>{orderData?.customerEmail || contacts.email || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  {orderData?.formattedTotal || formatMAD(totals.items || 0)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                <Text>{orderData?.formattedCreatedAt || "N/A"}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Current Status (Read-only) */}
        <Col xs={24} lg={12}>
          <Card title="Current Status">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Order Status">
                <Tag color={getStatusColor(orderData?.orderStatus)}>
                  {orderData?.orderStatus?.toUpperCase() || "UNKNOWN"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={getStatusColor(orderData?.paymentStatus || payment.status)}>
                  {(orderData?.paymentStatus || payment.status)?.toUpperCase() || "UNKNOWN"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Status">
                <Tag color={getStatusColor(delivery.status)}>
                  {delivery.status?.toUpperCase() || "UNKNOWN"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Edit Form */}
        <Col xs={24}>
          <Card title="Update Order Status">
            <Form {...formProps} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Order Status"
                    name="orderStatus"
                    rules={[
                      {
                        required: true,
                        message: "Please select order status",
                      },
                    ]}
                  >
                    <Select placeholder="Select order status">
                      {orderStatusOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          <Space>
                            <Tag color={getStatusColor(option.value)} style={{ margin: 0 }}>
                              {option.label.toUpperCase()}
                            </Tag>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Payment Status"
                    name="paymentStatus"
                    rules={[
                      {
                        required: true,
                        message: "Please select payment status",
                      },
                    ]}
                  >
                    <Select placeholder="Select payment status">
                      {paymentStatusOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          <Space>
                            <Tag color={getStatusColor(option.value)} style={{ margin: 0 }}>
                              {option.label.toUpperCase()}
                            </Tag>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Delivery Status"
                    name="deliveryStatus"
                    rules={[
                      {
                        required: true,
                        message: "Please select delivery status",
                      },
                    ]}
                  >
                    <Select placeholder="Select delivery status">
                      {deliveryStatusOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          <Space>
                            <Tag color={getStatusColor(option.value)} style={{ margin: 0 }}>
                              {option.label.toUpperCase()}
                            </Tag>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="Internal Notes"
                    name="internalNotes"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Add internal notes about this order (not visible to customer)"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="Customer Message"
                    name="customerMessage"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Message to send to customer (optional)"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </Edit>
  );
}; 