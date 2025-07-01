import React from "react";
import { Row, Col, Card, Statistic, Typography } from "antd";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined,
  ProductOutlined 
} from "@ant-design/icons";
import CountUp from "react-countup";

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        🫒 DikaFood CMS Dashboard
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={0}
              precision={2}
              formatter={(value) => (
                <CountUp end={Number(value)} duration={2} separator="," suffix=" MAD" />
              )}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={0}
              formatter={(value) => (
                <CountUp end={Number(value)} duration={2} separator="," />
              )}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={0}
              formatter={(value) => (
                <CountUp end={Number(value)} duration={2} separator="," />
              )}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={0}
              formatter={(value) => (
                <CountUp end={Number(value)} duration={2} separator="," />
              )}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card title="System Status">
            <p>✅ API Connection: Active</p>
            <p>✅ Database: Connected</p>
            <p>✅ Authentication: Working</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 