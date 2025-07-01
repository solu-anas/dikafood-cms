import React, { useState } from "react";
import { useTable, ShowButton, EditButton, DeleteButton } from "@refinedev/antd";
import {
  Table,
  Space,
  Typography,
  Avatar,
  Alert,
  Spin
} from "antd";
import { 
  CarOutlined, 
  RocketOutlined, 
  CrownOutlined,
  ShopOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { usePermissions } from "../../hooks/usePermissions";
import { useNavigation } from "../../hooks/useNavigation";
import { UniversalPage, StatusTag } from "../../components";
import type { StatusFilter, ActionButton } from "../../components";
import { getErrorMessage } from "../../utils/error";
import feedback from "../../utils/feedback";

const { Text } = Typography;

export const DeliveryMethodList: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const permissions = usePermissions();
  const navigation = useNavigation();
  const { tableProps, tableQueryResult } = useTable({
    resource: "delivery-methods",
    syncWithLocation: true,
  });
  const { isLoading, isError, error } = tableQueryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert {...feedback.alertProps("error", "Error", error)} />;

  const getTypeIcon = (type: string) => {
    const icons = {
      free: <CarOutlined />,
      express: <RocketOutlined />,
      premium: <CrownOutlined />,
      pickup: <ShopOutlined />,
    };
    return icons[type as keyof typeof icons] || <CarOutlined />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      free: "#52c41a",
      express: "#fa8c16", 
      premium: "#722ed1",
      pickup: "#1890ff"
    };
    return colors[type as keyof typeof colors] || "#666";
  };

  // Filter data based on active filter
  const getFilteredData = () => {
    if (!tableProps.dataSource) return [];
    
    switch (activeFilter) {
      case 'active':
        return tableProps.dataSource.filter((item: any) => !item.isSuspended && !item.metadata?.isSuspended);
      case 'suspended':
        return tableProps.dataSource.filter((item: any) => item.isSuspended || item.metadata?.isSuspended);
      case 'free':
        return tableProps.dataSource.filter((item: any) => (item.type || item.data?.type) === 'free');
      case 'paid':
        return tableProps.dataSource.filter((item: any) => 
          ['express', 'premium'].includes(item.type || item.data?.type)
        );
      case 'pickup':
        return tableProps.dataSource.filter((item: any) => (item.type || item.data?.type) === 'pickup');
      default:
        return tableProps.dataSource;
    }
  };

  const filteredData = getFilteredData();
  const totalMethods = tableProps.dataSource?.length || 0;
  const activeMethods = tableProps.dataSource?.filter((item: any) => !item.isSuspended && !item.metadata?.isSuspended).length || 0;
  const suspendedMethods = tableProps.dataSource?.filter((item: any) => item.isSuspended || item.metadata?.isSuspended).length || 0;
  const freeMethods = tableProps.dataSource?.filter((item: any) => (item.type || item.data?.type) === 'free').length || 0;
  const paidMethods = tableProps.dataSource?.filter((item: any) => 
    ['express', 'premium'].includes(item.type || item.data?.type)
  ).length || 0;

  const statusFilters: StatusFilter[] = [
    {
      key: 'all',
      label: 'All Methods',
      icon: <CarOutlined />,
      color: '#1890ff',
      bgColor: 'rgba(24, 144, 255, 0.15)',
      borderColor: 'rgba(24, 144, 255, 0.3)',
      count: totalMethods
    },
    {
      key: 'active',
      label: 'Active',
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      bgColor: 'rgba(82, 196, 26, 0.15)',
      borderColor: 'rgba(82, 196, 26, 0.3)',
      count: activeMethods
    },
    {
      key: 'suspended',
      label: 'Suspended',
      icon: <ExclamationCircleOutlined />,
      color: '#ff4d4f',
      bgColor: 'rgba(255, 77, 79, 0.15)',
      borderColor: 'rgba(255, 77, 79, 0.3)',
      count: suspendedMethods
    },
    {
      key: 'free',
      label: 'Free',
      icon: <CarOutlined />,
      color: '#52c41a',
      bgColor: 'rgba(82, 196, 26, 0.15)',
      borderColor: 'rgba(82, 196, 26, 0.3)',
      count: freeMethods
    },
    {
      key: 'paid',
      label: 'Paid',
      icon: <RocketOutlined />,
      color: '#fa8c16',
      bgColor: 'rgba(250, 140, 22, 0.15)',
      borderColor: 'rgba(250, 140, 22, 0.3)',
      count: paidMethods
    }
  ];

  const actionButtons: ActionButton[] = [
    {
      key: 'create',
      label: 'Create Method',
      icon: <PlusOutlined />,
      onClick: () => navigation.create('delivery-methods'),
      type: 'primary'
    }
  ];

  return (
    <UniversalPage
      title="Delivery Methods"
      statusFilters={statusFilters}
      activeStatusFilter={activeFilter}
      onStatusFilterChange={setActiveFilter}
      customActions={actionButtons}
      showCreateButton={false}
      tableProps={{
        ...tableProps,
        dataSource: filteredData,
        rowKey: (record: any, index?: number) => record.deliveryMethodId || record._id || record.id || `delivery-method-${index}`,
        scroll: { x: 1200 }
      }}
      tableClassName="delivery-methods-table"
      entityName="delivery methods"
    >
      <Table.Column
        title="Delivery Method"
        dataIndex="title"
        key="title"
        width={280}
        render={(value: string, record: any) => (
          <Space>
            <Avatar
              size={40}
              icon={getTypeIcon(record.type || record.data?.type)}
              style={{ backgroundColor: getTypeColor(record.type || record.data?.type) }}
            />
            <div>
              <Text strong style={{ color: 'var(--text-primary)' }}>
                {record.title || record.data?.title || value}
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: "12px", color: 'var(--text-secondary)' }}>
                  #{record.serialNumber || String(record.deliveryMethodId || record._id).slice(-8)}
                </Text>
              </div>
            </div>
          </Space>
        )}
      />

      <Table.Column
        title="Type"
        dataIndex="type"
        key="type"
        width={120}
        render={(type: string, record: any) => {
          const actualType = type || record.data?.type;
          const typeMap: Record<string, any> = {
            free: 'free',
            express: 'express', 
            premium: 'premium',
            pickup: 'pickup'
          };
          return (
            <StatusTag type={typeMap[actualType] || 'default'}>
              {actualType?.toUpperCase()}
            </StatusTag>
          );
        }}
      />

      <Table.Column
        title="Price"
        dataIndex="price"
        key="price"
        width={120}
        render={(price: number, record: any) => {
          const actualPrice = price !== undefined ? price : record.data?.unitPrice;
          return (
            <div>
              <Text strong style={{ color: 'var(--text-primary)' }}>
                {actualPrice || 0} MAD
              </Text>
              {actualPrice === 0 && (
                <div>
                  <StatusTag type="free">FREE</StatusTag>
                </div>
              )}
            </div>
          );
        }}
      />

      <Table.Column
        title="Delivery Time"
        dataIndex="estimation"
        key="estimation"
        width={150}
        render={(estimation: string, record: any) => {
          const actualEstimation = estimation || record.data?.estimation;
          // Extract number from string like "7 days" or use the nested data structure
          const days = typeof actualEstimation === 'string' 
            ? parseInt(actualEstimation.split(' ')[0]) || 0
            : actualEstimation || 0;
          
          return (
            <Space>
              <ClockCircleOutlined style={{ color: 'var(--text-secondary)' }} />
              <Text style={{ color: 'var(--text-primary)' }}>
                {days} {days !== 1 ? "days" : "day"}
              </Text>
            </Space>
          );
        }}
      />

      <Table.Column
        title="Status"
        dataIndex="isSuspended"
        key="status"
        width={120}
        render={(isSuspended: boolean, record: any) => {
          const actualSuspended = isSuspended !== undefined ? isSuspended : record.metadata?.isSuspended;
          return (
            <StatusTag type={actualSuspended ? "suspended" : "active"}>
              {actualSuspended ? "SUSPENDED" : "ACTIVE"}
            </StatusTag>
          );
        }}
      />

      <Table.Column
        title="Actions"
        dataIndex="actions"
        key="actions"
        width={120}
        fixed="right"
        render={(_: any, record: any) => {
          const actions = [];
          
          const recordId = record.deliveryMethodId || record._id;
          
          if (permissions.canAccess('delivery-methods', 'show')) {
            actions.push(
              <ShowButton key="show" hideText size="small" recordItemId={recordId} />
            );
          }
          
          if (permissions.canAccess('delivery-methods', 'show') && permissions.canAccess('delivery-methods', 'update') && actions.length > 0) {
            actions.push(
              <div key="separator1" style={{ 
                width: '1px', 
                height: '16px', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)' 
              }} />
            );
          }
          
          if (permissions.canAccess('delivery-methods', 'update')) {
            actions.push(
              <EditButton key="edit" hideText size="small" recordItemId={recordId} />
            );
          }
          
          if (permissions.canAccess('delivery-methods', 'update') && permissions.canAccess('delivery-methods', 'delete') && actions.length > 0) {
            actions.push(
              <div key="separator2" style={{ 
                width: '1px', 
                height: '16px', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)' 
              }} />
            );
          }
          
          if (permissions.canAccess('delivery-methods', 'delete')) {
            actions.push(
              <DeleteButton key="delete" hideText size="small" recordItemId={recordId} />
            );
          }
          
          return (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'flex-start',
              gap: '4px',
              padding: '4px 6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {actions}
            </div>
          );
        }}
      />
    </UniversalPage>
  );
}; 