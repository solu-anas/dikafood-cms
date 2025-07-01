import React from "react";
import { List } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Card, Image, Typography, Tag, Row, Col, Space, Select } from "antd";
import { PictureOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export const GalleryList: React.FC = () => {
    const { data, isLoading, isError } = useList({
        resource: "product-gallery",
        pagination: {
            pageSize: 50,
        },
        sorters: [
            {
                field: "brand",
                order: "asc",
            },
        ],
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading gallery</div>;

    const images = data?.data || [];

    // Group images by brand
    const groupedImages = images.reduce((acc: any, image: any) => {
        const brand = image.brand || 'unknown';
        if (!acc[brand]) {
            acc[brand] = [];
        }
        acc[brand].push(image);
        return acc;
    }, {});

    return (
        <List title="Product Gallery">
            <div style={{ padding: '16px 0' }}>
                {Object.entries(groupedImages).map(([brand, images]: [string, any]) => (
                    <div key={brand} style={{ marginBottom: '32px' }}>
                        <Title level={3} style={{ 
                            color: '#AACC00', 
                            borderBottom: '2px solid #AACC00',
                            paddingBottom: '8px',
                            marginBottom: '16px'
                        }}>
                            <PictureOutlined style={{ marginRight: '8px' }} />
                            {images[0]?.brandDisplayName || brand.charAt(0).toUpperCase() + brand.slice(1)}
                            <Tag color="lime" style={{ marginLeft: '8px' }}>
                                {images.length} images
                            </Tag>
                        </Title>
                        
                        <Row gutter={[16, 16]}>
                            {images.map((image: any, index: number) => (
                                <Col xs={24} sm={12} md={8} lg={6} xl={4} key={`${brand}-${index}`}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div style={{ 
                                                height: '200px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                backgroundColor: '#f5f5f5'
                                            }}>
                                                <Image
                                                    src={image.path}
                                                    alt={image.name}
                                                    style={{ 
                                                        maxHeight: '100%', 
                                                        maxWidth: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                    preview={{
                                                        mask: <div>View Full Size</div>
                                                    }}
                                                />
                                            </div>
                                        }
                                        size="small"
                                    >
                                        <Card.Meta
                                            title={
                                                <Text strong style={{ fontSize: '12px' }}>
                                                    {image.name}
                                                </Text>
                                            }
                                            description={
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Tag color="blue">{image.size}</Tag>
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                        {image.filename}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ))}
                
                {images.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '48px',
                        color: '#999'
                    }}>
                        <PictureOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                        <Title level={4} type="secondary">No images found</Title>
                        <Text type="secondary">
                            No product images are available in the gallery.
                        </Text>
                    </div>
                )}
            </div>
        </List>
    );
}; 