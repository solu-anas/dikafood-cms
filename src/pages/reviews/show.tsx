import React from "react";
import { useShow } from "@refinedev/core";
import { Show, TextField, DateField, TagField } from "@refinedev/antd";
import {
  Card,
  Space,
  Divider,
  Button,
  Row,
  Col,
  Avatar,
  Typography,
  Descriptions,
  Rate,
  Tag,
} from "antd";
import { 
  StarOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export const ReviewShow: React.FC = () => {
  const { queryResult } = useShow();
  const record = queryResult?.data?.data;
  
  const isActive = record?.status === 'active';

  return (
    <Show title="Review Details" canDelete={false} canEdit={false}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Card */}
        <Card>
          <Row gutter={24} align="middle">
            <Col flex="none">
              <Avatar 
                size={64}
                icon={<StarOutlined />}
                style={{ 
                  backgroundColor: isActive ? '#52c41a' : '#ff4d4f',
                  fontSize: '24px'
                }}
              />
            </Col>
            <Col flex="auto">
              <Title level={3} style={{ margin: 0 }}>
                Product Review
              </Title>
              <Space size="middle" style={{ marginTop: 8 }}>
                <Rate disabled value={record?.rating} style={{ fontSize: "16px" }} />
                <Text strong>{record?.rating}/5 Stars</Text>
                <Tag color={isActive ? 'green' : 'red'}>
                  {record?.status?.toUpperCase()}
                </Tag>
              </Space>
            </Col>
            <Col flex="none">
              <Space>
                <Button 
                  type={isActive ? "default" : "primary"}
                  danger={isActive}
                  icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                >
                  {isActive ? 'Suspend Review' : 'Activate Review'}
                </Button>
                <Button 
                  icon={<EyeOutlined />}
                >
                  View Product
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Review Content */}
        <Card title="Review Content">
          <div style={{ 
            padding: '20px', 
            background: '#fafafa',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            minHeight: '120px'
          }}>
            <Paragraph style={{ 
              fontSize: '16px', 
              lineHeight: '1.6',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {record?.review || 'No review content available'}
            </Paragraph>
          </div>
        </Card>

        {/* Product Information */}
        <Card title="Product Information">
          <Row gutter={24}>
            <Col span={4}>
              <Avatar 
                size={80}
                shape="square"
                icon={<ShoppingOutlined />}
                src={record?.productImageId ? `/files/${record.productImageId}` : undefined}
              />
            </Col>
            <Col span={20}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Product Name" span={2}>
                  <TextField value={record?.productTitle} />
                </Descriptions.Item>
                
                <Descriptions.Item label="Product ID">
                  <Text code>{record?.productSerialNumber}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Units Ordered">
                  <TextField value={record?.unitsCount} />
                </Descriptions.Item>
                
                <Descriptions.Item label="Unit Price" span={2}>
                  <TextField value={record?.price} />
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Order Information */}
        <Card title="Order Information">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Order ID">
              <Text code>{record?.orderSerialNumber}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Customer">
              <Space>
                <UserOutlined />
                <TextField value={record?.customerName} />
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Review Metadata */}
        <Card title="Review Details" size="small">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Review ID">
              <Text code>{record?.reviewId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={isActive ? 'green' : 'red'}>
                {record?.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Reviewed At">
              <TextField value={record?.reviewedAt} />
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </Show>
  );
}; 