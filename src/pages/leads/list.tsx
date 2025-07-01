import React, { useState } from "react";
import {
  useTable,
  getDefaultSortOrder,
  FilterDropdown,
  useSelect,
  TagField,
  EmailField,
  DateField,
  ShowButton,
} from "@refinedev/antd";
import { Table, Space, Select, Avatar, Tag, Typography, Card, Row, Col, Button, Statistic, Alert, Spin } from "antd";
import {
  UserOutlined, 
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  MessageOutlined,
  BookOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { StatusTag } from "../../components";
import { getErrorMessage } from "../../utils/error";
import feedback from "../../utils/feedback";

const { Text } = Typography;

export const LeadList = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { tableProps, sorters, tableQueryResult } = useTable({
    resource: "leads",
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "submittedAt",
          order: "desc",
        },
      ],
    },
  });
  const { isLoading, isError, error } = tableQueryResult;

  const { selectProps: typeSelectProps } = useSelect({
    resource: "leads",
    optionLabel: "type",
    optionValue: "type",
  });

  if (isLoading) return <Spin />;
  if (isError) return <Alert {...feedback.alertProps("error", "Error", error)} />;

  // Filter data based on active filter
  const getFilteredData = () => {
    if (!tableProps.dataSource) return [];
    
    switch (activeFilter) {
      case 'catalog':
        return tableProps.dataSource.filter((item: any) => item.type === 'catalog');
      case 'contact':
        return tableProps.dataSource.filter((item: any) => item.type === 'contact');
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return tableProps.dataSource.filter((item: any) => 
          new Date(item.submittedAt) > thirtyDaysAgo
        );
      default:
        return tableProps.dataSource;
    }
  };

  const filteredData = getFilteredData();
  const totalLeads = tableProps.dataSource?.length || 0;
  const catalogRequests = tableProps.dataSource?.filter((item: any) => item.type === 'catalog').length || 0;
  const contactMessages = tableProps.dataSource?.filter((item: any) => item.type === 'contact').length || 0;
  const recentLeads = tableProps.dataSource?.filter((item: any) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(item.submittedAt) > thirtyDaysAgo;
  }).length || 0;

  // Statistics cards data
  const statsData = [
    { title: 'Total Leads', value: totalLeads, icon: <TeamOutlined />, color: '#1890ff' },
    { title: 'Catalog Requests', value: catalogRequests, icon: <BookOutlined />, color: '#52c41a' },
    { title: 'Contact Messages', value: contactMessages, icon: <MessageOutlined />, color: '#faad14' },
    { title: 'Last 30 Days', value: recentLeads, icon: <CalendarOutlined />, color: '#ff4d4f' },
  ];

  const statusFilters = [
    { key: 'all', label: 'All Leads', icon: <TeamOutlined />, count: totalLeads },
    { key: 'catalog', label: 'Catalog Requests', icon: <BookOutlined />, count: catalogRequests },
    { key: 'contact', label: 'Contact Messages', icon: <MessageOutlined />, count: contactMessages },
    { key: 'recent', label: 'Recent (30d)', icon: <CalendarOutlined />, count: recentLeads }
  ];

  const columns = [
    {
      title: "Contact Person",
      dataIndex: "name",
      key: "name",
      render: (value: string, record: any) => (
        <Space>
          <Avatar 
            size={40}
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: record.type === 'catalog' ? '#52c41a' : '#faad14' 
            }}
          />
          <div>
            <Text strong style={{ color: 'var(--text-primary)' }}>{value}</Text>
            <br />
            <StatusTag 
              type={record.type === 'catalog' ? 'catalog' : 'contact'}
              size="small"
            >
              {record.type?.toUpperCase()}
            </StatusTag>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value: string) => (
        <Space>
          <EmailField value={value} style={{ color: 'var(--text-primary)' }} />
          <Button
            type="text"
            size="small"
            icon={<MailOutlined />}
            onClick={() => window.open(`mailto:${value}`)}
            style={{ color: 'var(--text-secondary)' }}
          />
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (value: string) => (
        value ? (
          <Space>
            <Text style={{ color: 'var(--text-primary)' }}>{value}</Text>
            <Button
              type="text"
              size="small"
              icon={<PhoneOutlined />}
              onClick={() => window.open(`tel:${value}`)}
              style={{ color: 'var(--text-secondary)' }}
            />
          </Space>
        ) : (
          <Text style={{ color: 'var(--text-tertiary)' }}>Not provided</Text>
        )
      ),
    },
    {
      title: "Message/Request",
      dataIndex: "message",
      key: "message",
      render: (value: string, record: any) => {
        if (record.type === 'catalog') {
          return (
            <div>
              <Text style={{ color: 'var(--text-primary)' }}>Catalog request</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px", color: 'var(--text-secondary)' }}>
                Requested product catalog
              </Text>
            </div>
          );
        }
        return (
          <div style={{ maxWidth: "300px" }}>
            <Text 
              ellipsis={{ tooltip: value }} 
              style={{ color: 'var(--text-secondary)' }}
            >
              {value || 'No message provided'}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value: string) => (
        <TagField 
          value={value} 
          color={value === 'catalog' ? 'green' : 'orange'}
          icon={value === 'catalog' ? <BookOutlined /> : <MessageOutlined />}
        />
      ),
      filterDropdown: (props: any) => (
        <FilterDropdown {...props}>
          <Select
            style={{ minWidth: 200 }}
            mode="multiple"
            placeholder="Select type"
            {...typeSelectProps}
          />
        </FilterDropdown>
      ),
    },
    {
      title: "Submitted At",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (value: any) => (
        <DateField value={value} format="MMM DD, YYYY HH:mm" style={{ color: 'var(--text-secondary)' }} />
      ),
      sorter: true,
      defaultSortOrder: getDefaultSortOrder("submittedAt", sorters),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record.id} />
          <Button
            type="text"
            size="small"
            icon={<MailOutlined />}
            onClick={() => window.open(`mailto:${record.email}`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <style>{`
        .ant-table-cell {
          padding-top: 16px !important;
          padding-bottom: 16px !important;
          position: relative;
        }
        .ant-table-cell:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          height: 50%;
          width: 1px;
          background-color: rgba(255, 255, 255, 0.08);
        }
        .ant-table-thead > tr > th {
          text-align: left !important;
        }
      `}</style>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
            <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ color: 'var(--text-primary)' }}
              />
            </Card>
          </Col>
        ))}
        </Row>

      {/* Page Header */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
        paddingBottom: '24px',
        marginBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 700,
          margin: 0,
          color: 'var(--text-primary)'
        }}>
          Leads Management
        </h1>
        
        {/* Status Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {statusFilters.map(filter => (
            <Button 
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              type="default"
              className="icon-text-separator"
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '36px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: activeFilter === filter.key 
                  ? 'rgba(24, 144, 255, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)',
                borderColor: activeFilter === filter.key 
                  ? 'rgba(24, 144, 255, 0.3)' 
                  : 'rgba(255, 255, 255, 0.15)',
                color: activeFilter === filter.key 
                  ? '#1890ff' 
                  : 'var(--text-tertiary)',
              }}
              icon={filter.icon}
            >
              <span style={{ marginLeft: '6px' }}>{filter.label}</span>
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: activeFilter === filter.key 
                  ? 'rgba(0,0,0,0.125)' 
                  : 'rgba(255,255,255,0.1)',
                color: activeFilter === filter.key 
                  ? '#1890ff' 
                  : 'var(--text-tertiary)',
                minWidth: '20px',
                textAlign: 'center',
              }}>
                {filter.count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <Table 
        {...tableProps} 
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          ...tableProps.pagination,
          total: filteredData.length,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} leads`,
        }}
      />
                </div>
  );
}; 