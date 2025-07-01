import React from "react";
import { Trash } from "../trash";
import { Tag, Typography, Space } from "antd";

const { Text } = Typography;

export const DeliveryMethodsTrash: React.FC = () => {
  const deliveryMethodColumns = [
    {
      title: "Title",
      dataIndex: ["data", "title"],
      key: "title",
      render: (value: string) => (
        <Text strong style={{ color: '#ffffff' }}>
          {value}
        </Text>
      ),
    },
    {
      title: "Type",
      dataIndex: ["data", "type"],
      key: "type",
      render: (value: string) => {
        const colors = {
          free: "green",
          express: "orange",
          premium: "purple",
          pickup: "blue"
        };
        return (
          <Tag color={colors[value as keyof typeof colors] || "default"}>
            {value?.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Unit Price",
      dataIndex: ["data", "unitPrice"],
      key: "unitPrice",
      render: (value: number) => (
        <Text strong style={{ color: '#2D865D' }}>
          {value === 0 ? "Free" : `${value} MAD`}
        </Text>
      ),
    },
    {
      title: "Estimation",
      dataIndex: ["data", "estimation"],
      key: "estimation",
      render: (value: number) => (
        <Tag>{value} days</Tag>
      ),
    },
    {
      title: "Location",
      dataIndex: ["data", "location"],
      key: "location",
      render: (locations: any[]) => (
        <div>
          {locations?.slice(0, 2).map((loc, index) => (
            <Tag key={index}>
              {loc.name}
            </Tag>
          ))}
          {locations?.length > 2 && (
            <Tag>+{locations.length - 2} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          <Tag color={record.metadata?.isSuspended ? "red" : "green"}>
            {record.metadata?.isSuspended ? "Suspended" : "Active"}
          </Tag>
        </Space>
      ),
    },
  ];

  return (
    <Trash
      resource="delivery-methods"
      title="Delivery Methods Trash"
      columns={deliveryMethodColumns}
    />
  );
}; 