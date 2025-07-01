import React from "react";
import { useLogin } from "@refinedev/core";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  Alert,
} from "antd";
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Custom prefix component with separator
const InputPrefix: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center',
    color: 'var(--text-tertiary)', // Using CSS variable for consistent off-white
  }}>
    {icon}
    <div style={{
      width: '1px',
      height: '14px',
      background: 'rgba(255, 255, 255, 0.2)',
      marginLeft: '10px',
      marginRight: '10px',
    }} />
  </div>
);

// Minimal error message extractor
function getErrorMessage(error: any): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.data && error.data.message) return error.data.message;
  return "An error occurred";
}

export const Login: React.FC = () => {
  const { mutate: login, isLoading, error } = useLogin();

  const onFinish = (values: any) => {
    login(values);
  };

  return (
    <Layout style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #0A5C26 0%, #AACC00 100%)"
    }}>
      <Card 
        style={{ 
          width: "100%", 
          maxWidth: 400, 
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)" 
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/logo.svg"
            alt="DikaFood"
            style={{
              height: "80px",
              width: "auto",
              marginBottom: "24px",
            }}
          />
        </div>

        <Divider />

        {error && (
          <Alert
            message="Login Failed"
            description={getErrorMessage(error)}
            type="error"
            showIcon
            style={{ marginBottom: "24px" }}
          />
        )}

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          className="login-form"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" }
            ]}
          >
            <Input 
              prefix={<InputPrefix icon={<UserOutlined />} />}
              placeholder="Enter your email"

            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password!" }
            ]}
          >
            <Input.Password 
              prefix={<InputPrefix icon={<LockOutlined />} />}
              placeholder="Enter your password"

            />
          </Form.Item>

          <Form.Item style={{ marginBottom: "16px" }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              icon={<LoginOutlined />}
              style={{ width: "100%" }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
}; 