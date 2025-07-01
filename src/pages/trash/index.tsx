import React from "react";
import { List, DeleteButton, ShowButton } from "@refinedev/antd";
import { Table, Space, Button, Tag, Typography, Card, Row, Col, Statistic } from "antd";
import { RestOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useCustomMutation, usePermissions, useCustom } from "@refinedev/core";

const { Text } = Typography;

interface TrashProps {
  resource: string;
  title?: string;
  columns?: any[];
}

export const Trash: React.FC<TrashProps> = ({ 
  resource, 
  title = "Trash", 
  columns = [] 
}) => {
  const { data: permissions } = usePermissions();
  const isOwnerOrRoot = (permissions as any)?.role === "owner" || (permissions as any)?.role === "root";

  const { data: trashData, isLoading, refetch } = useCustom({
    url: `http://localhost:1025/management/${resource}/trash`,
    method: "get",
  });

  const dataSource = Array.isArray(trashData?.data) ? trashData.data : [];
  
  // Debug logging
  console.log(`[${resource}] Trash Data:`, trashData);
  console.log(`[${resource}] Data Source:`, dataSource);
  console.log(`[${resource}] Is Loading:`, isLoading);
  
  const tableProps = {
    dataSource,
    loading: isLoading,
    pagination: {
      current: 1,
      pageSize: 10,
      total: dataSource.length,
    },
  };

  const { mutate: restoreItem } = useCustomMutation();
  const { mutate: permanentlyDelete } = useCustomMutation();

  const handleRestore = (id: string) => {
    restoreItem({
      url: `http://localhost:1025/management/${resource}/${id}/restore`,
      method: "put",
      values: {},
      successNotification: {
        message: "Item restored successfully",
        type: "success",
      },
      errorNotification: {
        message: "Failed to restore item",
        type: "error",
      },
    }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const handlePermanentDelete = (id: string) => {
    permanentlyDelete({
      url: `http://localhost:1025/management/${resource}/${id}/permanent`,
      method: "delete",
      values: {},
      successNotification: {
        message: "Item permanently deleted",
        type: "success",
      },
      errorNotification: {
        message: "Failed to permanently delete item",
        type: "error",
      },
    }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const defaultColumns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (value: string) => (
        <Text code copyable>
          {value.slice(-8)}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: () => (
        <Tag color="red" icon={<DeleteOutlined />}>
          Deleted
        </Tag>
      ),
    },
    {
      title: "Deleted At",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (value: string) => (
        <Text type="secondary">
          {value ? new Date(value).toLocaleString() : "N/A"}
        </Text>
      ),
    },
    {
      title: "Deleted By",
      dataIndex: "deletedBy",
      key: "deletedBy",
      render: (deletedBy: any) => (
        <Text type="secondary">
          {deletedBy?.data?.email || deletedBy?.data?.firstName || "System"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="small">
          <ShowButton
            hideText
            size="small"
            recordItemId={record._id}
            icon={<EyeOutlined />}
          />
          <Button
            type="primary"
            size="small"
            icon={<RestOutlined />}
            onClick={() => handleRestore(record._id)}
            title="Restore"
            className="icon-text-separator"
          >
            Restore
          </Button>
          {isOwnerOrRoot && (
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handlePermanentDelete(record._id)}
              title="Permanently Delete"
              className="icon-text-separator"
            >
              Delete Forever
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const finalColumns = columns.length > 0 ? [...columns, ...defaultColumns.slice(-2)] : defaultColumns;
  
  console.log(`[${resource}] Final Columns:`, finalColumns);
  console.log(`[${resource}] Custom Columns:`, columns);

  const deletedItems = dataSource;

  return (
    <List
      title={title}
      breadcrumb={false}
      headerButtons={[
        <Button
          key="back"
          onClick={() => window.history.back()}
        >
          Back to {resource}
        </Button>
      ]}
    >
      {/* Stats Card */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Items in Trash"
              value={deletedItems.length}
              prefix={<ReloadOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={18}>
            <div style={{ padding: '8px 0' }}>
              <Text type="secondary">
                Items in trash can be restored or permanently deleted. 
                {isOwnerOrRoot ? " Only owners and root users can permanently delete items." : ""}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
          <p><strong>Debug Info:</strong></p>
          <p>Data Source Length: {dataSource.length}</p>
          <p>Columns Length: {finalColumns.length}</p>
          <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
          {dataSource.length > 0 && (
            <p>First Item ID: {dataSource[0]?._id}</p>
          )}
        </div>
      )}

      <Table
        {...tableProps}
        columns={finalColumns}
        rowKey="_id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </List>
  );
}; 