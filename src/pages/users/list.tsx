import React, { useState } from "react";
import {
  useTable,
  ShowButton,
  EditButton,
  DeleteButton,
  CreateButton,
} from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Typography, Button, Tooltip, Popconfirm } from "antd";
import {
  UserOutlined,
  CrownOutlined,
  TeamOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ShoppingOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { usePermissions } from "../../hooks/usePermissions";
import { StatusTag } from "../../components";

const { Text } = Typography;

export const UserList: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const permissions = usePermissions();
  const { tableProps } = useTable({
    resource: "users",
    syncWithLocation: true,
  });

  // Filter data based on active filter
  const getFilteredData = () => {
    if (!tableProps.dataSource) return [];
    
    switch (activeFilter) {
      case 'active':
        return tableProps.dataSource.filter((item: any) => item.isVerified && !item.isSuspended);
      case 'suspended':
        return tableProps.dataSource.filter((item: any) => item.isSuspended);
      case 'pending':
        return tableProps.dataSource.filter((item: any) => !item.isVerified);
      case 'managers':
        return tableProps.dataSource.filter((item: any) => item.role === 'manager');
      case 'customers':
        return tableProps.dataSource.filter((item: any) => item.role === 'customer');
      case 'root':
        return tableProps.dataSource.filter((item: any) => item.role === 'root');
      default:
        return tableProps.dataSource;
    }
  };

  const filteredData = getFilteredData();
  const totalUsers = tableProps.dataSource?.length || 0;
  const rootUsers = tableProps.dataSource?.filter((item: any) => item.role === 'root').length || 0;
  const managers = tableProps.dataSource?.filter((item: any) => item.role === 'manager').length || 0;
  const customers = tableProps.dataSource?.filter((item: any) => item.role === 'customer').length || 0;
  const activeUsers = tableProps.dataSource?.filter((item: any) => item.isVerified && !item.isSuspended).length || 0;
  const suspendedUsers = tableProps.dataSource?.filter((item: any) => item.isSuspended).length || 0;

  const statusFilters = [
    { key: 'all', label: 'All Users', icon: <UserOutlined />, count: totalUsers },
    { key: 'active', label: 'Active', icon: <CheckCircleOutlined />, count: activeUsers },
    { key: 'suspended', label: 'Suspended', icon: <StopOutlined />, count: suspendedUsers },
    { key: 'managers', label: 'Managers', icon: <TeamOutlined />, count: managers },
    { key: 'customers', label: 'Customers', icon: <UserOutlined />, count: customers },
  ];

  // Only show root filter for root users
  if (permissions.isRoot) {
    statusFilters.push({ key: 'root', label: 'Root Users', icon: <CrownOutlined />, count: rootUsers });
  }

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
    return "Pending";
  };

  const handleSuspension = async (userId: string, suspend: boolean) => {
    // Implementation would call the appropriate API endpoint
    console.log(`${suspend ? "Suspending" : "Activating"} user:`, userId);
    // This would be implemented with proper API calls
  };

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            size={40}
            src={record.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <div>
              <Text strong style={{ color: 'var(--text-primary)' }}>
                {record.firstName} {record.lastName}
              </Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: "12px", color: 'var(--text-secondary)' }}>
                {record.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const roleMap: Record<string, any> = {
          root: 'featured',
          manager: 'active',
          customer: 'default'
        };
        return (
          <StatusTag type={roleMap[role] || 'default'} icon={getRoleIcon(role)}>
            {role?.toUpperCase()}
          </StatusTag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        const isVerified = record.isVerified || false;
        const isSuspended = record.isSuspended || false;
        
        let statusType: any = 'default';
        if (isSuspended) statusType = 'suspended';
        else if (isVerified) statusType = 'verified';
        else statusType = 'unverified';
        
        return (
          <Space direction="vertical" size="small">
            <StatusTag type={statusType}>
              {getStatusText(isVerified, isSuspended)}
            </StatusTag>
            <Space size="small">
              {isVerified ? (
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
              )}
              <Text style={{ fontSize: "11px", color: 'var(--text-secondary)' }}>
                {isVerified ? "Verified" : "Unverified"}
              </Text>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Text style={{ fontSize: "12px", color: 'var(--text-secondary)' }}>
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </Text>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {permissions.canAccess('users', 'show') && (
            <ShowButton hideText size="small" recordItemId={record.id} />
          )}
          
          {/* Only root can edit managers, managers can edit customers */}
          {((permissions.isRoot && record.role === "manager") || 
            (permissions.role === "manager" && record.role === "customer")) && 
            permissions.canAccess('users', 'update') && (
            <EditButton hideText size="small" recordItemId={record.id} />
          )}
          
          {/* Suspension actions */}
          {record.role !== "root" && permissions.canAccess('users', 'update') && (
            <Tooltip title={record.isSuspended ? "Activate User" : "Suspend User"}>
              <Popconfirm
                title={`Are you sure you want to ${record.isSuspended ? "activate" : "suspend"} this user?`}
                onConfirm={() => handleSuspension(record.id, !record.isSuspended)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  type={record.isSuspended ? "primary" : "default"}
                  danger={!record.isSuspended}
                  icon={record.isSuspended ? <CheckCircleOutlined /> : <StopOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
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
          User Management
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
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {permissions.isRoot && permissions.canAccess('users', 'create') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {/* Navigate to create */}}
                className="icon-text-separator"
              >
                Create Manager
              </Button>
            )}
          </div>
        </div>
      </div>

      <Table 
        {...tableProps} 
        dataSource={filteredData}
        columns={columns} 
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          total: filteredData.length,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
        }}
      />
    </div>
  );
}; 