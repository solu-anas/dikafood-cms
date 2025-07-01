import React from "react";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton,
  useForm,
  Create,
  Edit,
  Show,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import {
  Table,
  Space,
  Form,
  Input,
  Select,
  Card,
  Typography,
  Tag,
  Descriptions,
  Row,
  Col,
  InputNumber,
} from "antd";

const { Title, Text } = Typography;

// Export the new UniversalPage version from list.tsx
export { DeliveryMethodList } from "./list";

// Delivery Method Create Component
export const DeliveryMethodCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "delivery-methods",
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Create New Delivery Method">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="Delivery method title" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select placeholder="Select type">
                <Select.Option value="free">Free</Select.Option>
                <Select.Option value="express">Express</Select.Option>
                <Select.Option value="premium">Premium</Select.Option>
                <Select.Option value="pickup">Pickup</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Unit Price (MAD)"
              name="unitPrice"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Estimation (Days)"
              name="estimation"
              rules={[{ required: true, message: "Please enter estimation" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Country Codes"
          name="countryCodes"
          rules={[{ required: true, message: "Please enter country codes" }]}
        >
          <Select mode="tags" placeholder="Enter country codes (e.g., MA, FR)">
            <Select.Option value="MA">MA (Morocco)</Select.Option>
            <Select.Option value="FR">FR (France)</Select.Option>
            <Select.Option value="ES">ES (Spain)</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Create>
  );
};

// Delivery Method Edit Component
export const DeliveryMethodEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "delivery-methods",
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Edit Delivery Method">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Title"
              name={["data", "title"]}
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="Delivery method title" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Type"
              name={["data", "type"]}
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select placeholder="Select type">
                <Select.Option value="free">Free</Select.Option>
                <Select.Option value="express">Express</Select.Option>
                <Select.Option value="premium">Premium</Select.Option>
                <Select.Option value="pickup">Pickup</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Unit Price (MAD)"
              name={["data", "unitPrice"]}
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Estimation (Days)"
              name={["data", "estimation"]}
              rules={[{ required: true, message: "Please enter estimation" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};

// Delivery Method Show Component
export const DeliveryMethodShow: React.FC = () => {
  const { queryResult } = useShow({
    resource: "delivery-methods",
  });
  
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading} title="Delivery Method Details">
      <Card>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Title">
            {record?.data?.title || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag color={record?.data?.type === "free" ? "green" : "blue"}>
              {record?.data?.type || "N/A"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Unit Price">
            {record?.data?.unitPrice || 0} MAD
          </Descriptions.Item>
          <Descriptions.Item label="Estimation">
            {record?.data?.estimation || 0} days
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={record?.metadata?.isSuspended ? "red" : "green"}>
              {record?.metadata?.isSuspended ? "Suspended" : "Active"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Serial Number">
            {record?.metadata?.serialNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At" span={2}>
            {record?.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}
          </Descriptions.Item>
        </Descriptions>
        
        {record?.data?.shops && record.data.shops.length > 0 && (
          <Card style={{ marginTop: 16 }} title="Pickup Locations">
            {record.data.shops.map((shop: any, index: number) => (
              <Descriptions key={index} bordered size="small" style={{ marginBottom: 8 }}>
                <Descriptions.Item label="Name">{shop.title}</Descriptions.Item>
                <Descriptions.Item label="City">{shop.city}</Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>{shop.address}</Descriptions.Item>
              </Descriptions>
            ))}
          </Card>
        )}
      </Card>
    </Show>
  );
}; 