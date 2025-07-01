import React, { useEffect, useState } from "react";
import { useApiUrl, useCustom } from "@refinedev/core";
import { Card, Col, Row, Statistic, Typography, Space, Divider, Tag, Button } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  TruckOutlined,
  StarOutlined,
  FileTextOutlined,
  BankOutlined,
  ContactsOutlined,
  ShopOutlined,
  ShoppingOutlined,
  MessageOutlined,
  BarChartOutlined,
  RiseOutlined
} from "@ant-design/icons";
import CountUp from "react-countup";
import { formatMAD } from "../../providers/dataProvider";
import { PurchaseTest } from "../../components/PurchaseTest";
import { StatusTag } from "../../components";

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  // Fetch dashboard metrics
  const apiUrl = useApiUrl();
  
  const { data: stats, isLoading } = useCustom({
    url: `${apiUrl}/stats`,
    method: "get",
  });

  // Mock data for demonstration - replace with real API data
  const dashboardData = {
    orders: 150,
    products: 75,
    revenue: 25000,
    customers: 500,
    totalOrders: 1247,
    totalRevenue: 234567,
    totalCustomers: 892,
    totalProducts: 45,
    pendingOrders: 23,
    completedOrders: 1201,
    totalReviews: 456,
    avgRating: 4.6,
    totalLeads: 127,
    activeDeliveryMethods: 4,
    activeBankAccounts: 3,
    blogPosts: 12,
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    prefix?: React.ReactNode;
    suffix?: string;
    color?: string;
    formatter?: (value: number) => string;
  }> = ({ title, value, prefix, suffix, color = "#1890ff", formatter }) => (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ color }}
        formatter={(value) => 
          formatter 
            ? formatter(Number(value)) 
            : <CountUp end={Number(value)} separator="," />
        }
      />
    </Card>
  );

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          DikaFood CMS Dashboard
        </Title>
        <Text type="secondary">
          Welcome to your ecommerce management center
        </Text>
      </div>

      {/* Key Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Revenue"
            value={dashboardData.totalRevenue}
            prefix={<DollarOutlined />}
            color="#52c41a"
            formatter={(value) => formatMAD(value)}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Orders"
            value={dashboardData.totalOrders}
            prefix={<ShoppingCartOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Customers"
            value={dashboardData.totalCustomers}
            prefix={<UserOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Products"
            value={dashboardData.totalProducts}
            prefix={<ShopOutlined />}
            color="#fa8c16"
          />
        </Col>
      </Row>

      {/* Secondary Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={dashboardData.pendingOrders}
              prefix={<TruckOutlined />}
              valueStyle={{ color: "#fa541c" }}
            />
            <div style={{ marginTop: "8px" }}>
              <StatusTag type="pending">Needs Attention</StatusTag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Rating"
              value={dashboardData.avgRating}
              prefix={<StarOutlined />}
              suffix="/5"
              precision={1}
              valueStyle={{ color: "#fadb14" }}
            />
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary">{dashboardData.totalReviews} reviews</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="New Leads"
            value={dashboardData.totalLeads}
            prefix={<ContactsOutlined />}
            color="#13c2c2"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Blog Posts"
            value={dashboardData.blogPosts}
            prefix={<FileTextOutlined />}
            color="#eb2f96"
          />
        </Col>
      </Row>

      {/* Quick Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Order Status Overview" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Completed Orders</Text>
                <Text strong style={{ color: "#52c41a" }}>
                  {dashboardData.completedOrders}
                </Text>
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Pending Orders</Text>
                <Text strong style={{ color: "#fa541c" }}>
                  {dashboardData.pendingOrders}
                </Text>
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>Total Orders</Text>
                <Text strong style={{ color: "#1890ff" }}>
                  {dashboardData.totalOrders}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="System Status" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Active Products</Text>
                <StatusTag type="active">{dashboardData.totalProducts}</StatusTag>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Delivery Methods</Text>
                <StatusTag type="info">{dashboardData.activeDeliveryMethods}</StatusTag>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Bank Accounts</Text>
                <StatusTag type="featured">{dashboardData.activeBankAccounts}</StatusTag>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Customer Reviews</Text>
                <StatusTag type="warning">{dashboardData.totalReviews}</StatusTag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div style={{ marginTop: "24px" }}>
        <Card title="Quick Actions" size="small">
          <Space wrap>
            <StatusTag type="info" style={{ padding: "4px 12px", cursor: "pointer" }}>
              + Add New Product
            </StatusTag>
            <StatusTag type="active" style={{ padding: "4px 12px", cursor: "pointer" }}>
              View Pending Orders
            </StatusTag>
            <StatusTag type="featured" style={{ padding: "4px 12px", cursor: "pointer" }}>
              Manage Customers
            </StatusTag>
            <StatusTag type="warning" style={{ padding: "4px 12px", cursor: "pointer" }}>
              Review Management
            </StatusTag>
            <StatusTag type="processing" style={{ padding: "4px 12px", cursor: "pointer" }}>
              Check New Leads
            </StatusTag>
          </Space>
        </Card>
      </div>

      {/* Purchase Flow Test */}
      <div style={{ marginTop: "24px" }}>
        <PurchaseTest />
      </div>
    </div>
  );
};

export default DashboardPage; 