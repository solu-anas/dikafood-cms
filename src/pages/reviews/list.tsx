import React, { useState } from "react";
import {
  useTable,
  getDefaultSortOrder,
  FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Tag, Typography, Select, Rate, Avatar, Button, Alert, Spin } from "antd";
import { 
  EyeOutlined, 
  StarOutlined, 
  ShoppingOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { StatusTag } from "../../components";
import { getErrorMessage } from "../../utils/error";
import feedback from "../../utils/feedback";

const { Text } = Typography;

export const ReviewList = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { tableProps, sorters, tableQueryResult } = useTable({
    resource: "reviews",
    syncWithLocation: true,
  });
  const { isLoading, isError, error } = tableQueryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert {...feedback.alertProps("error", "Error", error)} />;

  // Filter data based on active filter
  const getFilteredData = () => {
    if (!tableProps.dataSource) return [];
    
    switch (activeFilter) {
      case 'active':
        return tableProps.dataSource.filter((item: any) => item.status === 'active');
      case 'suspended':
        return tableProps.dataSource.filter((item: any) => item.status === 'suspended');
      case 'high-rated':
        return tableProps.dataSource.filter((item: any) => item.rating >= 4);
      default:
        return tableProps.dataSource;
    }
  };

  const filteredData = getFilteredData();
  const totalReviews = tableProps.dataSource?.length || 0;
  const activeReviews = tableProps.dataSource?.filter((item: any) => item.status === 'active').length || 0;
  const suspendedReviews = tableProps.dataSource?.filter((item: any) => item.status === 'suspended').length || 0;
  const highRated = tableProps.dataSource?.filter((item: any) => item.rating >= 4).length || 0;

  const statusFilters = [
    { key: 'all', label: 'All Reviews', icon: <StarOutlined />, count: totalReviews },
    { key: 'active', label: 'Active', icon: <CheckCircleOutlined />, count: activeReviews },
    { key: 'suspended', label: 'Suspended', icon: <ExclamationCircleOutlined />, count: suspendedReviews },
    { key: 'high-rated', label: '4+ Stars', icon: <StarOutlined />, count: highRated }
  ];

  const columns = [
    {
      title: "Product",
      dataIndex: "productTitle",
      key: "productTitle",
      render: (value: string, record: any) => (
        <Space>
          <Avatar 
            size={40}
            icon={<ShoppingOutlined />}
            src={record.productImageId ? `/files/${record.productImageId}` : undefined}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Text strong style={{ color: 'var(--text-primary)' }}>{value}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px", color: 'var(--text-secondary)' }}>
              {record.productSerialNumber}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (value: number) => (
        <Space>
          <Rate disabled value={value} style={{ fontSize: "14px" }} />
          <Text style={{ color: 'var(--text-primary)' }}>{value}/5</Text>
        </Space>
      ),
      sorter: true,
      defaultSortOrder: getDefaultSortOrder("rating", sorters),
    },
    {
      title: "Review",
      dataIndex: "review",
      key: "review",
      render: (value: string) => (
        <div style={{ maxWidth: "300px" }}>
          <Text 
            ellipsis={{ tooltip: value }} 
            style={{ color: 'var(--text-secondary)' }}
          >
            {value}
          </Text>
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (value: string) => (
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#52c41a' }}
          />
          <Text style={{ color: 'var(--text-primary)' }}>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Order",
      dataIndex: "orderSerialNumber",
      key: "orderSerialNumber",
      render: (value: string, record: any) => (
        <div>
          <Text code style={{ color: 'var(--text-primary)' }}>{value}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px", color: 'var(--text-tertiary)' }}>
            {record.unitsCount} units
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <StatusTag type={value === "active" ? "active" : "suspended"}>
          {value?.toUpperCase()}
        </StatusTag>
      ),
      filterDropdown: (props: any) => (
        <FilterDropdown {...props}>
          <Select
            style={{ minWidth: 200 }}
            mode="multiple"
            placeholder="Select status"
            options={[
              { label: "Active", value: "active" },
              { label: "Suspended", value: "suspended" },
            ]}
          />
        </FilterDropdown>
      ),
    },
    {
      title: "Reviewed At",
      dataIndex: "reviewedAt",
      key: "reviewedAt",
      render: (value: string) => (
        <Text style={{ color: 'var(--text-secondary)' }}>{value}</Text>
      ),
      sorter: true,
      defaultSortOrder: getDefaultSortOrder("reviewedAt", sorters),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {/* Handle show */}}
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
          Reviews
        </h1>
        
        {/* Status Filters and Actions Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%' 
        }}>
          {/* Status Filter Buttons */}
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
                    ? 'rgba(250, 173, 20, 0.15)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: activeFilter === filter.key 
                    ? 'rgba(250, 173, 20, 0.3)' 
                    : 'rgba(255, 255, 255, 0.15)',
                  color: activeFilter === filter.key 
                    ? '#faad14' 
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
                    ? '#faad14' 
                    : 'var(--text-tertiary)',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="primary" 
              icon={<StarOutlined />}
              onClick={() => {/* Navigate to analytics */}}
              className="icon-text-separator"
            >
              Review Analytics
            </Button>
          </div>
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
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reviews`,
        }}
      />
    </div>
  );
}; 