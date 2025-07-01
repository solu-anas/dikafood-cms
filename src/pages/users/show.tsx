import React from "react";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { 
  Typography, 
  Card, 
  Space, 
  Tag, 
  Avatar, 
  Descriptions, 
  Row, 
  Col,
  Divider,
  Alert,
  Spin
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  CrownOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getErrorMessage } from "../../utils/error";

const { Title, Text } = Typography;

export const UserShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading, isError, error } = queryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert message="Error" description={getErrorMessage(error)} type="error" showIcon />;

  const record = data?.data;

  const getRoleIcon = (role: string) => {
    const icons = {
      root: <CrownOutlined style={{ color: "#ff4d4f" }} />,
      manager: <TeamOutlined style={{ color: "#1890ff" }} />,
      customer: <UserOutlined style={{ color: "#52c41a" }} />,
    };
    return icons[role as keyof typeof icons] || <UserOutlined />;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      root: "red",
      manager: "blue", 
      customer: "green",
    };
    return colors[role as keyof typeof colors] || "default";
  };

  const getStatusColor = (isVerified: boolean, isSuspended: boolean) => {
    if (isSuspended) return "error";
    if (isVerified) return "success";
    return "warning";
  };

  const getStatusText = (isVerified: boolean, isSuspended: boolean) => {
    if (isSuspended) return "Suspended";
    if (isVerified) return "Active";
    return "Pending Verification";
  };

  return (
    <Show isLoading={isLoading} title="User Details">
      <Row gutter={16}>
        {/* User Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" align="center" style={{ width: "100%" }}>
              <Avatar
                size={80}
                src={record?.avatar}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: 0 }}>
                  {record?.firstName} {record?.lastName}
                </Title>
                <Text type="secondary">{record?.email}</Text>
              </div>

              <Space direction="vertical" align="center" size="small">
                <Tag 
                  color={getRoleColor(record?.role)} 
                  icon={getRoleIcon(record?.role)}
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                >
                  {record?.role?.toUpperCase()}
                </Tag>
                
                <Tag color={getStatusColor(record?.isVerified, record?.isSuspended)}>
                  {getStatusText(record?.isVerified, record?.isSuspended)}
                </Tag>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* User Information */}
        <Col xs={24} lg={16}>
          <Card title="User Information">
            <Descriptions column={1} size="middle">
              <Descriptions.Item 
                label={<Space><UserOutlined /> Full Name</Space>}
              >
                {record?.firstName} {record?.lastName}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<Space><MailOutlined /> Email</Space>}
              >
                {record?.email}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<Space><PhoneOutlined /> Phone</Space>}
              >
                {record?.phone || "Not provided"}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<Space><CalendarOutlined /> Created</Space>}
              >
                {record?.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Account Status</Title>
            <Space direction="vertical" size="small">
              <Space>
                {record?.isVerified ? (
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                )}
                <Text>
                  Email {record?.isVerified ? "Verified" : "Not Verified"}
                </Text>
              </Space>
              
              {record?.isSuspended && (
                <Space>
                  <StopOutlined style={{ color: "#ff4d4f" }} />
                  <Text style={{ color: "#ff4d4f" }}>Account Suspended</Text>
                </Space>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Role-specific Information */}
      <Row gutter={16} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Card title="Role Permissions">
            {record?.role === "root" && (
              <Space direction="vertical">
                <Text strong>Root Administrator Permissions:</Text>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li>Create and manage manager accounts</li>
                  <li>Full access to all system resources</li>
                  <li>System configuration management</li>
                  <li>Complete audit log access</li>
                  <li>Emergency system controls</li>
                </ul>
              </Space>
            )}
            
            {record?.role === "manager" && (
              <Space direction="vertical">
                <Text strong>Manager Permissions:</Text>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li>Create and manage customer accounts</li>
                  <li>Product catalog management</li>
                  <li>Order processing and fulfillment</li>
                  <li>Customer support and reviews</li>
                  <li>Store analytics and reporting</li>
                </ul>
              </Space>
            )}
            
            {record?.role === "customer" && (
              <Space direction="vertical">
                <Text strong>Customer Permissions:</Text>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li>Browse product catalog</li>
                  <li>Place and manage orders</li>
                  <li>Manage personal profile</li>
                  <li>Write product reviews</li>
                  <li>Access order history</li>
                </ul>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </Show>
  );
}; 