import React from "react";
import { Trash } from "../trash";
import { Tag, Typography, Image, Space } from "antd";

const { Text } = Typography;

export const ProductsTrash: React.FC = () => {
  const productColumns = [
    {
      title: "Brand",
      dataIndex: "brandDisplayName",
      key: "brandDisplayName",
      render: (value: string, record: any) => (
        <Space direction="vertical" size="small">
          <Text strong>{value}</Text>
          <Tag color="blue">{record.brand}</Tag>
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (value: string) => (
        <Tag color="green">{value}</Tag>
      ),
    },
    {
      title: "Variants",
      dataIndex: "variants",
      key: "variants",
      render: (variants: any[]) => (
        <div>
          <Text strong>{variants?.length || 0}</Text>
          <Text type="secondary"> variants</Text>
          {variants && variants.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {variants.slice(0, 3).map((variant, index) => (
                <Tag key={index}>
                  {variant.size}
                </Tag>
              ))}
              {variants.length > 3 && (
                <Tag>+{variants.length - 3} more</Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "productStatus",
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          <Tag color={record.active ? "green" : "orange"}>
            {record.active ? "Active" : "Inactive"}
          </Tag>
          {record.featured && (
            <Tag color="gold">Featured</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Preview",
      key: "preview",
      render: (_: any, record: any) => {
        const firstVariant = record.variants?.[0];
        const imageUrl = firstVariant?.imageUrl;
        
        return imageUrl ? (
          <Image
            src={`http://localhost:1025${imageUrl}`}
            alt={record.brandDisplayName}
            width={40}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div style={{ width: 40, height: 40, backgroundColor: '#f5f5f5', borderRadius: 4 }} />
        );
      },
    },
  ];

  return (
    <Trash
      resource="products"
      title="Products Trash"
      columns={productColumns}
    />
  );
}; 