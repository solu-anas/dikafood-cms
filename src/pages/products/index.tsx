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
  Switch,
  Card,
  Typography,
  Tag,
  Image,
  Descriptions,
  Row,
  Col,
  Button,
  InputNumber,
  Upload,
  message,
  Alert,
  Spin,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { formatMAD } from "../../providers/dataProvider";
import { getErrorMessage } from "../../utils/error";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Available sizes
const SIZES = [
  { value: "500ML", label: "500ML" },
  { value: "1L", label: "1L" },
  { value: "2L", label: "2L" },
  { value: "5L", label: "5L" },
  { value: "10L", label: "10L" },
  { value: "25L", label: "25L" },
];

// Hook to fetch dynamic brands
const useBrands = () => {
  const [brands, setBrands] = React.useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products/brands');
        const data = await response.json();
        if (data.success && data.data?.brands) {
          const brandOptions = data.data.brands.map((brand: string) => ({
            value: brand,
            label: brand.charAt(0).toUpperCase() + brand.slice(1),
          }));
          setBrands(brandOptions);
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
        // Fallback to hardcoded brands
        setBrands([
          { value: "chourouk", label: "Chourouk" },
          { value: "nouarti", label: "Nouarti" },
          { value: "biladi", label: "Biladi" },
          { value: "ouedfes", label: "Oued Fès" },
          { value: "dika", label: "Dika" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading };
};

// Hook to fetch dynamic categories
const useCategories = () => {
  const [categories, setCategories] = React.useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products/categories');
        const data = await response.json();
        if (data.success && data.data?.categories) {
          const categoryOptions = data.data.categories.map((category: string) => ({
            value: category,
            label: category.charAt(0).toUpperCase() + category.slice(1).replace(/ oil/i, ' Oil'),
          }));
          setCategories(categoryOptions);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to hardcoded categories
        setCategories([
          { value: "olive oil", label: "Olive Oil" },
          { value: "sunflower oil", label: "Sunflower Oil" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

// Product List Component
export const ProductList: React.FC = () => {
  const { tableProps, tableQueryResult } = useTable({
    resource: "products",
    syncWithLocation: true,
  });
  const { isLoading, isError, error } = tableQueryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert message="Error" description={getErrorMessage(error)} type="error" showIcon />;

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      width: 100,
              render: (value: string) => <Text code>{value ? String(value).slice(-8) : "N/A"}</Text>,
    },
    {
      title: "Brand",
      dataIndex: "brandDisplayName",
      key: "brandDisplayName",
      render: (value: string, record: any) => (
        <Tag color="blue">{value || record.brand}</Tag>
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (value: string) => (
        <Text ellipsis={{ tooltip: value }}>
          {value || "No description"}
        </Text>
      ),
    },
    {
      title: "Variants",
      dataIndex: "variantCount",
      key: "variantCount",
      render: (value: number) => (
        <Tag color="purple">{value} variants</Tag>
      ),
    },
    {
      title: "Price Range",
      dataIndex: "formattedPrice",
      key: "formattedPrice",
      render: (value: string, record: any) => {
        if (record.variants && record.variants.length > 0) {
          const prices = record.variants.map((v: any) => v.price).sort((a: number, b: number) => a - b);
          const minPrice = prices[0];
          const maxPrice = prices[prices.length - 1];
          
          if (minPrice === maxPrice) {
            return <Text strong>{formatMAD(minPrice)}</Text>;
          }
          
          return (
            <Text strong>
              {formatMAD(minPrice)} - {formatMAD(maxPrice)}
            </Text>
          );
        }
        return <Text type="secondary">No pricing</Text>;
      },
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (value: boolean) => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      render: (value: boolean) => (
        value ? <Tag color="gold">Featured</Tag> : null
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => (
        <Space>
          <ShowButton hideText size="small" recordItemId={record._id} />
          <EditButton hideText size="small" recordItemId={record._id} />
          <DeleteButton hideText size="small" recordItemId={record._id} />
        </Space>
      ),
    },
  ];

  return (
    <List
      title="🫒 Products"
      headerButtons={<CreateButton />}
    >
      <Table {...tableProps} columns={columns} rowKey="_id" />
    </List>
  );
};

// Product Create Component
export const ProductCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    redirect: "list",
    warnWhenUnsavedChanges: true,
  });

  const { brands, loading: brandsLoading } = useBrands();
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <Create saveButtonProps={saveButtonProps} title="Create New Product">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Product Name"
              name="name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input placeholder="e.g., Extra Virgin Olive Oil" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Brand"
              name="brand"
              rules={[{ required: true, message: "Please select a brand" }]}
            >
              <Select 
                placeholder="Select brand" 
                options={brands} 
                loading={brandsLoading}
                disabled={brandsLoading}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Brand Display Name"
              name="brandDisplayName"
              rules={[{ required: true, message: "Please enter brand display name" }]}
            >
              <Input placeholder="e.g., Chourouk Olive Oil" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select 
                placeholder="Select category" 
                options={categories}
                loading={categoriesLoading}
                disabled={categoriesLoading}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          label="Description" 
          name="description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <TextArea rows={3} placeholder="Product description (minimum 10 characters)" />
        </Form.Item>

        <Form.Item 
          label="Short Description" 
          name="shortDescription"
        >
          <TextArea rows={2} placeholder="Brief product description (optional)" />
        </Form.Item>

        <Form.Item label="Product Variants" name="variants">
          <VariantManager />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Active"
              name="active"
              valuePropName="checked"
            >
              <Switch defaultChecked />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Featured"
              name="featured"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Origin" name="origin">
              <Input placeholder="e.g., Morocco" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};

// Product Show Component
export const ProductShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading, isError, error } = queryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert message="Error" description={getErrorMessage(error)} type="error" showIcon />;

  const record = data?.data;

  return (
    <Show isLoading={isLoading} title="Product Details">
      <Row gutter={16}>
        <Col span={24}>
          <Card>
            <Descriptions title="Product Information" bordered>
              <Descriptions.Item label="ID" span={3}>
                <Text code>{record?._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Brand">
                <Tag color="blue">{record?.brandDisplayName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Internal Brand">
                <Text code>{record?.brand}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="green">{record?.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {record?.description || "No description"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={record?.active ? "green" : "red"}>
                  {record?.active ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Featured">
                {record?.featured ? (
                  <Tag color="gold">Featured</Tag>
                ) : (
                  <Text type="secondary">Not featured</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {record?.createdAt ? new Date(record.createdAt).toLocaleDateString() : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {record?.variants && record.variants.length > 0 && (
        <Row gutter={16} style={{ marginTop: "16px" }}>
          <Col span={24}>
            <Card title="Product Variants">
              <Row gutter={[16, 16]}>
                {record.variants.map((variant: any, index: number) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div>
                          <Text strong>Size: </Text>
                          <Tag color="blue">{variant.size}</Tag>
                        </div>
                        <div>
                          <Text strong>Price: </Text>
                          <Text style={{ color: "#52c41a", fontWeight: "bold" }}>
                            {formatMAD(variant.price)}
                          </Text>
                        </div>
                        <div>
                          <Text strong>Stock: </Text>
                          <Text>{variant.stock || "N/A"}</Text>
                        </div>
                        {variant.images && variant.images.length > 0 && (
                          <div>
                            <Text strong>Images:</Text>
                            <div style={{ marginTop: "8px" }}>
                              {variant.images.map((img: string, imgIndex: number) => (
                                <Image
                                  key={imgIndex}
                                  width={50}
                                  height={50}
                                  src={img}
                                  style={{ marginRight: "8px" }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </Show>
  );
};

// Variant Manager Component (for Create/Edit forms)
const VariantManager: React.FC<{ value?: any[]; onChange?: (value: any[]) => void }> = ({
  value = [],
  onChange,
}) => {
  // Initialize with one variant if empty
  React.useEffect(() => {
    if (value.length === 0) {
      const initialVariant = {
        size: "1L",
        price: 0,
        stock: 0,
        image: null,
        currency: "MAD",
        active: true,
      };
      onChange?.([initialVariant]);
    }
  }, [value.length, onChange]);

  const handleAddVariant = () => {
    const newVariant = {
      size: "1L",
      price: 0,
      stock: 0,
      image: null,
      currency: "MAD",
      active: true,
    };
    onChange?.([...value, newVariant]);
  };

  const handleRemoveVariant = (index: number) => {
    if (value.length > 1) {
      const newVariants = value.filter((_, i) => i !== index);
      onChange?.(newVariants);
    }
  };

  const handleVariantChange = (index: number, field: string, fieldValue: any) => {
    const newVariants = [...value];
    newVariants[index] = { ...newVariants[index], [field]: fieldValue };
    onChange?.(newVariants);
  };

  if (value.length === 0) {
    return <Spin />;
  }

  return (
    <Card size="small" title="Product Variants" extra={
      <Button
        type="primary"
        size="small"
        onClick={handleAddVariant}
        icon={<PlusOutlined />}
      >
        Add Variant
      </Button>
    }>
      <Space direction="vertical" style={{ width: "100%" }}>
        {value.map((variant, index) => (
          <Card key={index} size="small" style={{ background: "#fafafa" }}>
            <Row gutter={16} align="middle">
              <Col span={5}>
                <Text strong>Size:</Text>
                <Select
                  value={variant.size}
                  onChange={(val) => handleVariantChange(index, "size", val)}
                  options={SIZES}
                  placeholder="Size"
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Col>
              <Col span={5}>
                <Text strong>Price (MAD):</Text>
                <InputNumber
                  value={variant.price}
                  onChange={(val) => handleVariantChange(index, "price", val || 0)}
                  placeholder="0.00"
                  style={{ width: "100%", marginTop: 4 }}
                  min={0}
                  precision={2}
                />
              </Col>
              <Col span={5}>
                <Text strong>Stock:</Text>
                <InputNumber
                  value={variant.stock}
                  onChange={(val) => handleVariantChange(index, "stock", val || 0)}
                  placeholder="0"
                  style={{ width: "100%", marginTop: 4 }}
                  min={0}
                />
              </Col>
              <Col span={6}>
                <Text strong>Status:</Text>
                <div style={{ marginTop: 4 }}>
                  <Switch
                    checked={variant.active !== false}
                    onChange={(checked) => handleVariantChange(index, "active", checked)}
                    size="small"
                  />
                  <Text style={{ marginLeft: 8 }}>
                    {variant.active !== false ? "Active" : "Inactive"}
                  </Text>
                </div>
              </Col>
              <Col span={3}>
                <Button
                  danger
                  size="small"
                  onClick={() => handleRemoveVariant(index)}
                  disabled={value.length === 1}
                  title={value.length === 1 ? "Cannot remove the last variant" : "Remove variant"}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          </Card>
        ))}
      </Space>
    </Card>
  );
}; 