import React from "react";
import {
  Show,
  TextField,
  DateField,
  TagField,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
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
} from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, MessageOutlined, DownloadOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const LeadShow: React.FC = () => {
  const { queryResult } = useShow();
  const record = queryResult?.data?.data;
  
  const isContactMessage = record?.metadata?.useCase === 'contact';
  const isCatalogRequest = record?.metadata?.useCase === 'catalog';

  return (
    <Show title="Lead Details" canDelete={false} canEdit={false}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Card */}
        <Card>
          <Row gutter={24} align="middle">
            <Col flex="none">
              <Avatar 
                size={64}
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: isCatalogRequest ? '#52c41a' : '#fa8c16',
                  fontSize: '24px'
                }}
              />
            </Col>
            <Col flex="auto">
              <Title level={3} style={{ margin: 0 }}>
                {record?.name} {record?.surname}
              </Title>
              <Space size="middle" style={{ marginTop: 8 }}>
                <TagField
                  value={record?.metadata?.useCase}
                  color={isCatalogRequest ? 'green' : 'orange'}
                  icon={isCatalogRequest ? <DownloadOutlined /> : <MessageOutlined />}
                />
                <Text type="secondary">
                  <CalendarOutlined /> Submitted <DateField value={record?.createdAt} format="MMM DD, YYYY at HH:mm" />
                </Text>
              </Space>
            </Col>
            <Col flex="none">
              <Space>
                <Button 
                  type="primary" 
                  icon={<MailOutlined />}
                  href={`mailto:${record?.email}`}
                >
                  Send Email
                </Button>
                {record?.phone && (
                  <Button 
                    icon={<PhoneOutlined />}
                    href={`tel:${record?.phone}`}
                  >
                    Call
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Lead Type Information */}
        <Card title={
          <Space>
            {isCatalogRequest ? <DownloadOutlined /> : <MessageOutlined />}
            {isCatalogRequest ? 'Catalog Request' : 'Contact Message'}
          </Space>
        }>
          {isCatalogRequest ? (
            <div style={{ 
              padding: '20px', 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f',
              borderRadius: '6px'
            }}>
              <Space direction="vertical" size="small">
                <Text strong style={{ color: '#389e0d' }}>
                  Catalog Download Request
                </Text>
                <Text type="secondary">
                  This lead requested to download our product catalogs from the landing page. 
                  They were provided with secure download links for both French and Arabic versions.
                </Text>
              </Space>
            </div>
          ) : (
            <div style={{ 
              padding: '20px', 
              background: '#fff7e6', 
              border: '1px solid #ffd591',
              borderRadius: '6px'
            }}>
              <Space direction="vertical" size="small">
                <Text strong style={{ color: '#d46b08' }}>
                  💬 Contact Form Message
                </Text>
                <Text type="secondary">
                  This lead sent a message through the contact form on the landing page.
                </Text>
              </Space>
            </div>
          )}
        </Card>

        {/* Contact Information */}
        <Card title="Contact Information">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Full Name" span={2}>
              <Space>
                <UserOutlined />
                <TextField value={`${record?.name} ${record?.surname}`} />
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Email Address">
              <Space>
                <MailOutlined />
                <a href={`mailto:${record?.email}`}>
                  <TextField value={record?.email} />
                </a>
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Phone Number">
              <Space>
                <PhoneOutlined />
                {record?.phone ? (
                  <a href={`tel:${record?.phone}`}>
                    <TextField value={record?.phone} />
                  </a>
                ) : (
                  <Text type="secondary">Not provided</Text>
                )}
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Submission Date" span={2}>
              <Space>
                <CalendarOutlined />
                <DateField value={record?.createdAt} format="MMMM DD, YYYY at HH:mm:ss" />
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Message Content (only for contact messages) */}
        {isContactMessage && record?.message && (
          <Card title="Message Content">
            <div style={{ 
              padding: '16px', 
              background: '#fafafa',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              minHeight: '100px'
            }}>
              <Text style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {record.message}
              </Text>
            </div>
          </Card>
        )}

        {/* Metadata */}
        <Card title="Technical Details" size="small">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Lead Type">
              <TagField
                value={record?.metadata?.useCase}
                color={isCatalogRequest ? 'green' : 'orange'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Lead ID">
              <Text code>{record?.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              <DateField value={record?.createdAt} format="YYYY-MM-DD HH:mm:ss" />
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              <DateField value={record?.updatedAt} format="YYYY-MM-DD HH:mm:ss" />
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </Show>
  );
}; 