import React, { useState, useMemo } from "react";
import {
  DeleteButton,
  EditButton,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Typography, Tag } from "antd";
import { 
  AppstoreOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined 
} from "@ant-design/icons";
import UniversalPage, { StatusFilter } from "../../components/layout/UniversalPage";

const { Text } = Typography;

export const CategoryList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");

  // Status filters configuration
  const statusFilters: StatusFilter[] = useMemo(() => [
    {
      key: "all",
      label: "All",
      icon: <AppstoreOutlined />,
      color: "#1890ff",
      bgColor: "rgba(24, 144, 255, 0.15)",
      borderColor: "rgba(24, 144, 255, 0.3)",
      count: tableProps.dataSource?.length || 0
    },
    {
      key: "active",
      label: "Active",
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
      bgColor: "rgba(82, 196, 26, 0.15)",
      borderColor: "rgba(82, 196, 26, 0.3)",
      count: tableProps.dataSource?.filter((item: any) => item.active !== false).length || 0
    },
    {
      key: "inactive",
      label: "Inactive",
      icon: <ExclamationCircleOutlined />,
      color: "#ff4d4f",
      bgColor: "rgba(255, 77, 79, 0.15)",
      borderColor: "rgba(255, 77, 79, 0.3)",
      count: tableProps.dataSource?.filter((item: any) => item.active === false).length || 0
    }
  ], [tableProps.dataSource]);

  // Filter data based on active status filter
  const filteredData = useMemo(() => {
    if (!tableProps.dataSource) return [];
    
    switch (activeStatusFilter) {
      case "active":
        return tableProps.dataSource.filter((item: any) => item.active !== false);
      case "inactive":
        return tableProps.dataSource.filter((item: any) => item.active === false);
      default:
        return tableProps.dataSource;
    }
  }, [tableProps.dataSource, activeStatusFilter]);

  const handleStatusFilterChange = (key: string) => {
    setActiveStatusFilter(key);
  };

  return (
    <UniversalPage
      title="Categories"
      statusFilters={statusFilters}
      activeStatusFilter={activeStatusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      showCreateButton={true}
      createButtonLabel="Create Category"
      createButtonIcon={<PlusOutlined />}
      tableProps={{
        ...tableProps,
        dataSource: filteredData,
        rowKey: "id"
      }}
      tableClassName="categories-table"
      entityName="categories"
      customStyles={`
        .categories-table .ant-table-cell {
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }
      `}
    >
      <Table.Column 
        title="#" 
        dataIndex="id" 
        width={80}
        render={(value) => <Text code style={{ fontSize: '12px' }}>{value}</Text>}
      />
      
      <Table.Column 
        title="Category" 
        dataIndex="title" 
        width={300}
        render={(value, record: any) => (
          <div>
            <Text strong style={{ fontFamily: 'var(--font-body)' }}>
              {value || "Unnamed Category"}
            </Text>
            <div style={{ marginTop: '4px' }}>
              <Tag
                color={record.active !== false ? "success" : "error"}
                style={{ fontSize: '11px', fontWeight: 500 }}
              >
                {record.active !== false ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>
        )}
      />
      
      <Table.Column 
        title="Description" 
        dataIndex="description" 
        width={200}
        render={(value) => (
          <Text 
            style={{ 
              color: 'var(--text-tertiary)',
              fontSize: '13px',
              maxWidth: 180,
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {value || "No description"}
          </Text>
        )}
      />
      
      <Table.Column
        title="Actions"
        dataIndex="actions"
        key="actions"
        align="left"
        fixed="right"
        width={120}
        render={(_, record: BaseRecord) => (
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
            <ShowButton hideText size="small" recordItemId={record.id} />
            <div style={{ 
              width: '1px', 
              height: '16px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)' 
            }} />
            <EditButton hideText size="small" recordItemId={record.id} />
            <div style={{ 
              width: '1px', 
              height: '16px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)' 
            }} />
            <DeleteButton hideText size="small" recordItemId={record.id} />
          </div>
        )}
      />
    </UniversalPage>
  );
};
