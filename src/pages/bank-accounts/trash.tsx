import React from "react";
import { Trash } from "../trash";
import { Tag, Typography, Space } from "antd";

const { Text } = Typography;

export const BankAccountsTrash: React.FC = () => {
  const bankAccountColumns = [
    {
      title: "Bank Name",
      dataIndex: ["data", "bankName"],
      key: "bankName",
      render: (value: string) => (
        <Text strong style={{ color: '#ffffff' }}>
          {value}
        </Text>
      ),
    },
    {
      title: "Owner Name",
      dataIndex: ["data", "ownerName"],
      key: "ownerName",
      render: (value: string) => (
        <Text>{value}</Text>
      ),
    },
    {
      title: "Account Number",
      dataIndex: ["data", "details", "accountNumber"],
      key: "accountNumber",
      render: (value: string) => (
        <Text code>
          {value ? `****${value.slice(-4)}` : "N/A"}
        </Text>
      ),
    },
    {
      title: "Countries",
      dataIndex: ["data", "countries"],
      key: "countries",
      render: (countries: any[]) => (
        <div>
          {countries?.slice(0, 2).map((country, index) => (
            <Tag key={index} color="blue">
              {country.name}
            </Tag>
          ))}
          {countries?.length > 2 && (
            <Tag>+{countries.length - 2} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => (
        <Space direction="vertical">
          <Tag color={record.metadata?.isSuspended ? "red" : "green"}>
            {record.metadata?.isSuspended ? "Suspended" : "Active"}
          </Tag>
          <Tag color={record.metadata?.isDisabled ? "orange" : "blue"}>
            {record.metadata?.isDisabled ? "Disabled" : "Enabled"}
          </Tag>
        </Space>
      ),
    },
  ];

  return (
    <Trash
      resource="bank-accounts"
      title="Bank Accounts Trash"
      columns={bankAccountColumns}
    />
  );
}; 