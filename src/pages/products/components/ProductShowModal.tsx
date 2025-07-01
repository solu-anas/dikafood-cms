import React from "react";
import { useOne } from "@refinedev/core";
import { Modal, Card, Descriptions, Tag, Typography, Row, Col, Image, Spin, Alert, Divider, List } from "antd";
import { API_BASE_URL } from "../../../config/api";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { StatusTag } from '../list';
import { getProductImageUrlById } from '../../../utils/api';

const { Text } = Typography;

interface ProductShowModalProps {
  productId: string;
  visible: boolean;
  onClose: () => void;
}

export const ProductShowModal: React.FC<ProductShowModalProps> = ({ productId, visible, onClose }) => {
  const { data, isLoading, isError } = useOne({
    resource: "products",
    id: productId,
    queryOptions: {
      enabled: !!productId,
    },
  });

  // Use the correct product object from the data provider
  const record = data?.data;

  const renderContent = () => {
    if (isLoading) {
      return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spin size="large" /></div>;
    }
    if (isError) {
      return <Alert message="Error" description="Could not load product details." type="error" showIcon />;
    }
    if (record) {
      return (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card bordered={false}>
                <Descriptions title="Product Information" bordered column={2}>
                  <Descriptions.Item label="ID"><Text code>{record._id}</Text></Descriptions.Item>
                  <Descriptions.Item label="Brand">{record.brandDisplayName || record.brand}</Descriptions.Item>
                  <Descriptions.Item label="Category">{record.category}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {record.active && <StatusTag type="active">Active</StatusTag>}
                    {!record.active && <StatusTag type="inactive">Inactive</StatusTag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Featured">
                    {record.featured ? <StatusTag type="featured">Yes</StatusTag> : <Text type="secondary">No</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Deleted">
                    {record.deleted ? <StatusTag type="deleted">Yes</StatusTag> : <StatusTag type="active">No</StatusTag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description" span={2}>{record.description || "N/A"}</Descriptions.Item>
                  {record.shortDescription && (
                    <Descriptions.Item label="Short Description" span={2}>{record.shortDescription}</Descriptions.Item>
                  )}
                  {record.origin && (
                    <Descriptions.Item label="Origin">{record.origin}</Descriptions.Item>
                  )}
                  {record.acidity && (
                    <Descriptions.Item label="Acidity">{record.acidity}</Descriptions.Item>
                  )}
                  {record.rating !== undefined && (
                    <Descriptions.Item label="Rating">{record.rating}</Descriptions.Item>
                  )}
                  {record.reviewCount !== undefined && (
                    <Descriptions.Item label="Review Count">{record.reviewCount}</Descriptions.Item>
                  )}
                  {record.createdAt && (
                    <Descriptions.Item label="Created At">{new Date(record.createdAt).toLocaleString()}</Descriptions.Item>
                  )}
                  {record.updatedAt && (
                    <Descriptions.Item label="Updated At">{new Date(record.updatedAt).toLocaleString()}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            {/* Images Gallery */}
            {record.images && record.images.length > 0 && (
              <Col span={24}>
                <Card title="Images Gallery" size="small">
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {record.images.map((img: string, idx: number) => (
                      <AsyncImage key={idx} imageId={img} height={80} />
                    ))}
                  </div>
                </Card>
              </Col>
            )}

            {/* Features */}
            {record.features && record.features.length > 0 && (
              <Col span={12}>
                <Card title="Features" size="small">
                  <List
                    size="small"
                    dataSource={record.features}
                    renderItem={item => <List.Item><Tag color="blue">{String(item)}</Tag></List.Item>}
                  />
                </Card>
              </Col>
            )}
            {/* Benefits */}
            {record.benefits && record.benefits.length > 0 && (
              <Col span={12}>
                <Card title="Benefits" size="small">
                  <List
                    size="small"
                    dataSource={record.benefits}
                    renderItem={item => <List.Item><Tag color="green">{String(item)}</Tag></List.Item>}
                  />
                </Card>
              </Col>
            )}

            {/* Nutritional Info */}
            {record.nutritionalInfo && (
              <Col span={24}>
                <Card title="Nutritional Information" size="small">
                  <Descriptions column={4} size="small">
                    {Object.entries(record.nutritionalInfo).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}>{typeof value === 'string' || typeof value === 'number' ? value : (value ? String(value) : '-')}</Descriptions.Item>
                    ))}
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Variants */}
            {record.variants?.map((variant: any, index: number) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card title={`Variant: ${variant.size}`} size="small">
                  <Row gutter={16}>
                    <Col span={8}>
                      <AsyncImage imageId={variant.image} height={80} />
                    </Col>
                    <Col span={16}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Price">{variant.price} {variant.currency || 'MAD'}</Descriptions.Item>
                        <Descriptions.Item label="Stock">{variant.stock} units</Descriptions.Item>
                        {variant.active !== undefined && (
                          <Descriptions.Item label="Active">{variant.active ? 'Yes' : 'No'}</Descriptions.Item>
                        )}
                      </Descriptions>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}

            {/* Related Products */}
            {record.relatedProducts && record.relatedProducts.length > 0 && (
              <Col span={24}>
                <Card title="Related Products" size="small">
                  <Row gutter={[8, 8]}>
                    {record.relatedProducts.map((rel: any, idx: number) => {
                      const firstVariant = rel.variants?.[0];
                      return (
                        <Col key={rel._id || idx} xs={24} sm={12} md={8} lg={6} xl={4}>
                          <Card bordered={true} size="small">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              {rel.images && rel.images.length > 0 ? (
                                <AsyncImage imageId={rel.images[0]} height={48} />
                              ) : (
                                <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4 }} />
                              )}
                              <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 500 }}>{rel.name}</div>
                              {firstVariant && (
                                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                                  {firstVariant.size} — {firstVariant.price} {firstVariant.currency || 'MAD'}
                                </div>
                              )}
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Card>
              </Col>
            )}
          </Row>
        </div>
      );
    }
    return <Alert message="No data" description="Product details could not be found." type="warning" showIcon />;
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
      styles={{
        body: {
          padding: '16px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '16px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          margin: '-20px -24px 0 -24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            borderRight: '1px solid rgba(255, 255, 255, 0.15)',
            paddingRight: '16px'
          }}>
            <EyeOutlined style={{ 
              color: 'rgba(255, 255, 255, 0.85)', 
              fontSize: '18px' 
            }} />
          </div>
          <div>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.85)', 
              fontSize: '18px', 
              fontWeight: 500,
              lineHeight: '22px'
            }}>
              Product Details
            </div>
            {record && (
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.65)', 
                fontSize: '14px', 
                fontWeight: 400,
                lineHeight: '18px',
                marginTop: '2px'
              }}>
                {record.name}
              </div>
            )}
          </div>
        </div>
      }
    >
      {renderContent()}
    </Modal>
  );
};

const AsyncImage: React.FC<{ imageId: string; height?: number }> = ({ imageId, height = 80 }) => {
  const [src, setSrc] = React.useState<string | null>(null);
  React.useEffect(() => {
    let mounted = true;
    if (imageId) {
      getProductImageUrlById(imageId).then(url => {
        if (mounted) setSrc(url);
      });
    } else {
      setSrc(null);
    }
    return () => { mounted = false; };
  }, [imageId]);
  if (!src) return <>No Image</>;
  return <Image src={src} height={height} style={{ objectFit: 'contain' }} crossOrigin="anonymous" />;
};