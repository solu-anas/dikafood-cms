import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { usePermissions } from "@refinedev/core";
import feedback from "../../utils/feedback";

interface UserPermissions {
  role?: string;
}
import { Form, Input, Row, Col, Typography, Alert, Space } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const UserCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "managers", // This will use the manager creation endpoint
    redirect: "list",
  });

  const { data: permissions } = usePermissions<UserPermissions>();
  const isRoot = permissions?.role === "root";
  const isOwner = permissions?.role === "owner";

  // Only root and owner users can create managers
  if (!isRoot && !isOwner) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          {...feedback.alertProps("error", "Access Denied", "Only Root administrators and Business owners can create new managers.")}
        />
      </div>
    );
  }

  return (
    <Create 
      saveButtonProps={saveButtonProps}
      title={
        <Space>
          <TeamOutlined />
          <span>Create New Manager</span>
        </Space>
      }
    >
      <Alert
        message="Manager Creation"
        description="Creating a new manager account. The manager will receive an email verification link and must verify their account within 24 hours."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Form {...formProps} layout="vertical">
        <Title level={4}>Personal Information</Title>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[
                { required: true, message: "Please enter first name" },
                { min: 2, message: "First name must be at least 2 characters" }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Enter first name"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[
                { required: true, message: "Please enter last name" },
                { min: 2, message: "Last name must be at least 2 characters" }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Enter last name"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Title level={4} style={{ marginTop: "24px" }}>Contact Information</Title>

        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter email address" },
            { type: "email", message: "Please enter a valid email address" }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="Enter email address"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            { required: true, message: "Please enter phone number" },
            { pattern: /^\+?[1-9]\d{1,14}$/, message: "Please enter a valid phone number" }
          ]}
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="Enter phone number (e.g., +212612345678)"
            size="large"
          />
        </Form.Item>

        <Title level={4} style={{ marginTop: "24px" }}>Security</Title>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please enter password" },
            { min: 8, message: "Password must be at least 8 characters" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message: "Password must contain uppercase, lowercase, number and special character"
            }
          ]}
          extra="Password must be at least 8 characters with uppercase, lowercase, number and special character"
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Enter secure password"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: "Please confirm password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Confirm password"
            size="large"
          />
        </Form.Item>

        <Alert
          {...feedback.alertProps("warning", "Important Notes", (
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>The manager will receive an email verification link</li>
              <li>They must verify their account within 24 hours</li>
              <li>Managers can create and manage customer accounts</li>
              <li>Managers cannot create other manager accounts</li>
            </ul>
          ))}
          style={{ marginTop: "16px" }}
        />
      </Form>
    </Create>
  );
}; 