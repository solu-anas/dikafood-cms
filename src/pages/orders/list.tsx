import React, { useState, useMemo } from "react";
import {
  useTable,
  EditButton,
  ShowButton,
  getDefaultSortOrder,
  FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Tag, Typography, Select, Button, Alert, Spin } from "antd";
import { 
  EyeOutlined, 
  EditOutlined, 
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { formatMAD } from "../../providers/dataProvider";
import UniversalPage, { StatusFilter } from "../../components/layout/UniversalPage";
import { StatusTag } from "../../components";
import { getErrorMessage } from "../../utils/error";
import feedback from "../../utils/feedback";

const { Text } = Typography;

export const OrderList = () => {
  const { tableProps, sorters, tableQueryResult } = useTable({
    resource: "orders",
    syncWithLocation: true,
  });
  const { isLoading, isError, error } = tableQueryResult;

  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");

  if (isLoading) return <Spin />;
  if (isError) return <Alert {...feedback.alertProps("error", "Error", error)} />;

  // Status filters configuration
  const statusFilters: StatusFilter[] = useMemo(() => [
    {
      key: "all",
      label: "All Orders",
      icon: <ShoppingCartOutlined />,
      color: "#1890ff",
      bgColor: "rgba(24, 144, 255, 0.15)",
      borderColor: "rgba(24, 144, 255, 0.3)",
      count: tableProps.dataSource?.length || 0
    },
    {
      key: "draft",
      label: "Draft",
      icon: <ClockCircleOutlined />,
      color: "#faad14",
      bgColor: "rgba(250, 173, 20, 0.15)",
      borderColor: "rgba(250, 173, 20, 0.3)",
      count: tableProps.dataSource?.filter((order: any) => order.orderStatus === 'draft').length || 0
    },
    {
      key: "pending",
      label: "Pending",
      icon: <ClockCircleOutlined />,
      color: "#faad14",
      bgColor: "rgba(250, 173, 20, 0.15)",
      borderColor: "rgba(250, 173, 20, 0.3)",
      count: tableProps.dataSource?.filter((order: any) => order.orderStatus === 'pending').length || 0
    },
    {
      key: "confirmed",
      label: "Confirmed",
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
      bgColor: "rgba(82, 196, 26, 0.15)",
      borderColor: "rgba(82, 196, 26, 0.3)",
      count: tableProps.dataSource?.filter((order: any) => order.orderStatus === 'confirmed').length || 0
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: <CheckCircleOutlined />,
      color: "#1890ff",
      bgColor: "rgba(24, 144, 255, 0.15)",
      borderColor: "rgba(24, 144, 255, 0.3)",
      count: tableProps.dataSource?.filter((order: any) => order.orderStatus === 'delivered').length || 0
    },
    {
      key: "cancelled",
      label: "Cancelled",
      icon: <StopOutlined />,
      color: "#ff4d4f",
      bgColor: "rgba(255, 77, 79, 0.15)",
      borderColor: "rgba(255, 77, 79, 0.3)",
      count: tableProps.dataSource?.filter((order: any) => order.orderStatus === 'cancelled').length || 0
    }
  ], [tableProps.dataSource]);

  // Filter data based on active status filter
  const filteredData = useMemo(() => {
    if (!tableProps.dataSource) return [];
    
    switch (activeStatusFilter) {
      case "draft":
        return tableProps.dataSource.filter((order: any) => order.orderStatus === 'draft');
      case "pending":
        return tableProps.dataSource.filter((order: any) => order.orderStatus === 'pending');
      case "confirmed":
        return tableProps.dataSource.filter((order: any) => order.orderStatus === 'confirmed');
      case "delivered":
        return tableProps.dataSource.filter((order: any) => order.orderStatus === 'delivered');
      case "cancelled":
        return tableProps.dataSource.filter((order: any) => order.orderStatus === 'cancelled');
      default:
        return tableProps.dataSource;
    }
  }, [tableProps.dataSource, activeStatusFilter]);

  const handleStatusFilterChange = (key: string) => {
    setActiveStatusFilter(key);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "orange",
      confirmed: "blue",
      preparing: "cyan",
      ready: "green",
      delivering: "purple",
      delivered: "success",
      cancelled: "error",
      unknown: "default"
    };
    return statusColors[status] || "default";
  };

  const getPaymentColor = (status: string) => {
    const paymentColors: Record<string, string> = {
      pending: "orange",
      processing: "blue",
      completed: "success",
      failed: "error",
      refunded: "purple",
      cancelled: "error",
      unknown: "default"
    };
    return paymentColors[status] || "default";
  };

  return (
    <UniversalPage
      title="Orders"
      statusFilters={statusFilters}
      activeStatusFilter={activeStatusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      showCreateButton={true}
      createButtonLabel="Create Order"
      createButtonIcon={<PlusOutlined />}
      tableProps={{
        ...tableProps,
        dataSource: filteredData,
        rowKey: (record: any, index?: number) => record.orderId || record.id || `order-${index}`,
        scroll: { x: 1200 }
      }}
      tableClassName="orders-table"
      entityName="orders"
      customStyles={`
        .orders-table .ant-table-cell {
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }
      `}
    >
      <Table.Column
        title="#"
        dataIndex="orderSerialNumber"
        width={100}
        sorter={{ multiple: 2 }}
        defaultSortOrder={getDefaultSortOrder("orderSerialNumber", sorters)}
        render={(value) => (
          <Text code style={{ fontSize: "12px" }}>
            #{value || "N/A"}
          </Text>
        )}
      />

      <Table.Column
        title="Customer"
        dataIndex={["contact", "fullName"]}
        width={250}
        sorter={{ multiple: 1 }}
        render={(value, record: any) => (
          <div>
            <Text strong style={{ fontFamily: 'var(--font-body)' }}>
              {record.contact?.fullName || "N/A"}
            </Text>
            <div style={{ marginTop: '4px' }}>
              <Text style={{ fontSize: "12px", color: 'var(--text-tertiary)' }}>
                {record.contact?.email || "N/A"}
              </Text>
            </div>
          </div>
        )}
      />

      <Table.Column
        title="Total"
        dataIndex={["payment", "totalAmount"]}
        width={120}
        sorter={{ multiple: 1 }}
        render={(value, record: any) => (
          <Text strong style={{ color: "#AACC00", fontSize: '14px' }}>
            {typeof value === 'number' ? formatMAD(value) : (value || "N/A")}
          </Text>
        )}
      />

      <Table.Column
        title="Order Status"
        dataIndex="orderStatus"
        width={140}
        render={(value) => {
          const statusMap: Record<string, any> = {
            draft: 'pending',
            pending: 'pending',
            confirmed: 'confirmed',
            preparing: 'processing',
            ready: 'success',
            delivering: 'processing',
            delivered: 'delivered',
            cancelled: 'cancelled'
          };
          return (
            <StatusTag type={statusMap[value] || 'default'}>
              {value?.toUpperCase() || "UNKNOWN"}
            </StatusTag>
          );
        }}
        filterDropdown={(props) => (
          <FilterDropdown {...props}>
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              placeholder="Select status"
              options={[
                { label: "Draft", value: "draft" },
                { label: "Pending", value: "pending" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Preparing", value: "preparing" },
                { label: "Ready", value: "ready" },
                { label: "Delivering", value: "delivering" },
                { label: "Delivered", value: "delivered" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
          </FilterDropdown>
        )}
      />

      <Table.Column
        title="Payment"
        dataIndex="orderPhase"
        width={130}
        render={(value, record: any) => {
          // Try to determine payment status from order status and phase
          let paymentStatus = 'pending';
          if (record.orderStatus === 'confirmed' || record.orderStatus === 'delivered') {
            paymentStatus = 'paid';
          } else if (record.orderStatus === 'cancelled') {
            paymentStatus = 'cancelled';
          } else if (record.orderStatus === 'draft') {
            paymentStatus = 'unpaid';
          }
          
          const paymentMap: Record<string, any> = {
            pending: 'pending',
            processing: 'processing',
            paid: 'paid',
            unpaid: 'unpaid',
            completed: 'success',
            failed: 'error',
            refunded: 'warning',
            cancelled: 'cancelled'
          };
          return (
            <StatusTag type={paymentMap[paymentStatus] || 'default'}>
              {paymentStatus?.toUpperCase() || "PENDING"}
            </StatusTag>
          );
        }}
        filterDropdown={(props) => (
          <FilterDropdown {...props}>
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              placeholder="Select payment status"
              options={[
                { label: "Pending", value: "pending" },
                { label: "Paid", value: "paid" },
                { label: "Unpaid", value: "unpaid" },
                { label: "Failed", value: "failed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
          </FilterDropdown>
        )}
      />

      <Table.Column
        title="Order Date"
        dataIndex="createdAt"
        width={150}
        sorter={{ multiple: 1 }}
        defaultSortOrder={getDefaultSortOrder("createdAt", sorters)}
        render={(value) => (
          <Text style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {value ? new Date(value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : "N/A"}
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
        render={(_, record) => (
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
            <ShowButton
              hideText
              size="small"
              recordItemId={record.orderId}
              icon={<EyeOutlined />}
            />
            <div style={{ 
              width: '1px', 
              height: '16px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)' 
            }} />
            <EditButton
              hideText
              size="small"
              recordItemId={record.orderId}
              icon={<EditOutlined />}
            />
          </div>
        )}
      />
    </UniversalPage>
  );
}; 