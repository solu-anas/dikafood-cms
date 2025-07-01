import React, { useState, useEffect } from "react";
import { 
  Card, 
  Button, 
  Steps, 
  Form, 
  Input, 
  Select, 
  Table, 
  Space, 
  Typography, 
  message, 
  Row, 
  Col,
  Divider,
  Tag,
  Spin
} from "antd";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  TruckOutlined, 
  CreditCardOutlined,
  CheckCircleOutlined 
} from "@ant-design/icons";
import { cartService, CartItem } from "../services/cartService";
import { formatMAD } from "../providers/dataProvider";

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface PurchaseTestProps {
  customerId?: string;
  productId?: string;
}

export const PurchaseTest: React.FC<PurchaseTestProps> = ({ 
  customerId = "test_customer_001", 
  productId = "test_product_001" 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  
  const [contactForm] = Form.useForm();
  const [deliveryForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  // Load initial data
  useEffect(() => {
    loadCart();
    loadDeliveryMethods();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      // cartService.getCustomerCart does not exist, use getCart instead
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      message.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryMethods = async () => {
    try {
      const methods = await cartService.getDeliveryMethods();
      setDeliveryMethods(methods);
    } catch (error) {
      console.error("Failed to load delivery methods:", error);
    }
  };

  const addTestProductToCart = async () => {
    setLoading(true);
    try {
      const success = await cartService.addToCart(customerId, productId, 2);
      if (success) {
        message.success("Product added to cart!");
        await loadCart();
      } else {
        message.error("Failed to add product to cart");
      }
    } catch (error) {
      message.error("Error adding product to cart");
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      message.error("Cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const itemIds = cart.items.map((item: CartItem) => item.id);
      const checkoutData = await cartService.startCheckout(customerId, itemIds);
      setOrderId(checkoutData.orderId || checkoutData.id);
      setCurrentStep(1);
      message.success("Checkout started!");
    } catch (error) {
      message.error("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const submitContact = async (values: any) => {
    setLoading(true);
    try {
      const success = await cartService.addContactToCheckout(orderId, values);
      if (success) {
        setCurrentStep(2);
        message.success("Contact information saved!");
      } else {
        message.error("Failed to save contact information");
      }
    } catch (error) {
      message.error("Error saving contact information");
    } finally {
      setLoading(false);
    }
  };

  const submitDelivery = async (values: any) => {
    setLoading(true);
    try {
      const deliveryData = {
        deliveryMethodId: values.deliveryMethod,
        deliveryLocation: {
          country: values.country,
          city: values.city,
          address: values.address
        }
      };
      
      const success = await cartService.addDeliveryToCheckout(orderId, deliveryData);
      if (success) {
        setCurrentStep(3);
        message.success("Delivery information saved!");
      } else {
        message.error("Failed to save delivery information");
      }
    } catch (error) {
      message.error("Error saving delivery information");
    } finally {
      setLoading(false);
    }
  };

  const submitPayment = async (values: any) => {
    setLoading(true);
    try {
      const paymentData = {
        paymentMethod: values.paymentMethod,
        paymentDetails: values.paymentMethod === 'stripe' ? {
          cardNumber: values.cardNumber,
          expiryMonth: values.expiryMonth,
          expiryYear: values.expiryYear,
          cvc: values.cvc
        } : {}
      };
      
      const result = await cartService.processPayment(orderId, paymentData);
      setCurrentStep(4);
      message.success("Payment processed successfully!");
    } catch (error) {
      message.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const cartColumns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (name: string, item: CartItem) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {item.variantName}
          </Text>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => formatMAD(price),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total: number) => (
        <Text strong style={{ color: "#1890ff" }}>
          {formatMAD(total)}
        </Text>
      ),
    },
  ];

  const steps = [
    {
      title: 'Cart',
      icon: <ShoppingCartOutlined />,
      content: (
        <Card title="Shopping Cart">
          {cart && cart.items && cart.items.length > 0 ? (
            <>
              <Table
                dataSource={cart.items}
                columns={cartColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
              <Divider />
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong style={{ fontSize: "16px" }}>
                    Total: {formatMAD(cart.totalAmount || 0)}
                  </Text>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    onClick={startCheckout}
                    loading={loading}
                  >
                    Start Checkout
                  </Button>
                </Col>
              </Row>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Text type="secondary">Cart is empty</Text>
              <br />
              <Button 
                type="primary" 
                onClick={addTestProductToCart}
                loading={loading}
                style={{ marginTop: "16px" }}
              >
                Add Test Product
              </Button>
            </div>
          )}
        </Card>
      ),
    },
    {
      title: 'Contact',
      icon: <UserOutlined />,
      content: (
        <Card title="Contact Information">
          <Form
            form={contactForm}
            layout="vertical"
            onFinish={submitContact}
            initialValues={{
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com",
              phone: "+212600000000"
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: "Please enter first name" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: "Please enter last name" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email" }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: "Please enter phone number" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Continue to Delivery
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: 'Delivery',
      icon: <TruckOutlined />,
      content: (
        <Card title="Delivery Information">
          <Form
            form={deliveryForm}
            layout="vertical"
            onFinish={submitDelivery}
            initialValues={{
              deliveryMethod: "standard",
              country: "MA",
              city: "Casablanca",
              address: "123 Test Street"
            }}
          >
            <Form.Item
              name="deliveryMethod"
              label="Delivery Method"
              rules={[{ required: true, message: "Please select delivery method" }]}
            >
              <Select>
                <Option value="standard">Standard Delivery</Option>
                <Option value="express">Express Delivery</Option>
                <Option value="pickup">Store Pickup</Option>
              </Select>
            </Form.Item>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="country"
                  label="Country"
                  rules={[{ required: true, message: "Please enter country" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: "Please enter city" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Continue to Payment
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: 'Payment',
      icon: <CreditCardOutlined />,
      content: (
        <Card title="Payment Information">
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={submitPayment}
            initialValues={{
              paymentMethod: "stripe"
            }}
          >
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: "Please select payment method" }]}
            >
              <Select>
                <Option value="stripe">Credit Card (Stripe)</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="cash_on_delivery">Cash on Delivery</Option>
              </Select>
            </Form.Item>
            
            <Form.Item dependencies={['paymentMethod']} noStyle>
              {({ getFieldValue }) => {
                const paymentMethod = getFieldValue('paymentMethod');
                
                if (paymentMethod === 'stripe') {
                  return (
                    <Row gutter={[16, 16]}>
                      <Col xs={24}>
                        <Form.Item
                          name="cardNumber"
                          label="Card Number"
                          rules={[{ required: true, message: "Please enter card number" }]}
                        >
                          <Input placeholder="4242 4242 4242 4242" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="expiryMonth"
                          label="Expiry Month"
                          rules={[{ required: true, message: "Please enter expiry month" }]}
                        >
                          <Input placeholder="12" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="expiryYear"
                          label="Expiry Year"
                          rules={[{ required: true, message: "Please enter expiry year" }]}
                        >
                          <Input placeholder="2025" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="cvc"
                          label="CVC"
                          rules={[{ required: true, message: "Please enter CVC" }]}
                        >
                          <Input placeholder="123" />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                }
                
                return null;
              }}
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Complete Purchase
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />,
      content: (
        <Card title="Order Complete">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <CheckCircleOutlined 
              style={{ fontSize: "64px", color: "#52c41a", marginBottom: "16px" }} 
            />
            <Title level={3}>Order Completed Successfully!</Title>
            <Text type="secondary">
              Order ID: <Text code>{orderId}</Text>
            </Text>
            <br />
            <Button 
              type="primary" 
              style={{ marginTop: "16px" }}
              onClick={() => {
                setCurrentStep(0);
                setOrderId("");
                loadCart();
              }}
            >
              Start New Order
            </Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Purchase Flow Test</Title>
      <Text type="secondary">
        Test the complete purchase flow from cart to order completion
      </Text>
      
      <Divider />
      
      <Steps current={currentStep} style={{ marginBottom: "24px" }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} icon={step.icon} />
        ))}
      </Steps>
      
      <Spin spinning={loading}>
        {steps[currentStep].content}
      </Spin>
    </div>
  );
};