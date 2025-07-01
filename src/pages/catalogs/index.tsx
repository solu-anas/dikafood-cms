import React from "react";
import { List } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Card, Typography, Tag, Row, Col, Button, Space } from "antd";
import { BookOutlined, DownloadOutlined, EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const CatalogsList: React.FC = () => {
    const { data, isLoading, isError } = useList({
        resource: "catalogs",
    });

    if (isLoading) return <div>Loading catalogs...</div>;
    if (isError) return <div>Error loading catalogs</div>;

    const catalogs = data?.data || [];

    const handleDownload = (catalog: any) => {
        // Open the public URL for download
        window.open(catalog.publicUrl, '_blank');
    };

    const handlePreview = (catalog: any) => {
        // Open the catalog in a new tab for preview
        window.open(catalog.publicUrl, '_blank');
    };

    return (
        <List title="Company Catalogs">
            <div style={{ padding: '16px 0' }}>
                <Row gutter={[24, 24]}>
                    {catalogs.map((catalog: any) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={catalog.id}>
                            <Card
                                hoverable
                                cover={
                                    <div style={{ 
                                        height: '200px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        backgroundColor: '#f5f5f5',
                                        fontSize: '48px',
                                        color: '#AACC00'
                                    }}>
                                        <BookOutlined />
                                    </div>
                                }
                                actions={[
                                    <Button 
                                        key="preview"
                                        type="text" 
                                        icon={<EyeOutlined />}
                                        onClick={() => handlePreview(catalog)}
                                    >
                                        Preview
                                    </Button>,
                                    <Button 
                                        key="download"
                                        type="text" 
                                        icon={<DownloadOutlined />}
                                        onClick={() => handleDownload(catalog)}
                                    >
                                        Download
                                    </Button>
                                ]}
                            >
                                <Card.Meta
                                    title={catalog.name}
                                    description={
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Text type="secondary">{catalog.description}</Text>
                                            <div>
                                                <Tag color={catalog.language === 'fr' ? 'blue' : 'green'}>
                                                    {catalog.language === 'fr' ? 'Français' : 'العربية'}
                                                </Tag>
                                                {catalog.size && (
                                                    <Tag color="default">{catalog.size}</Tag>
                                                )}
                                            </div>
                                            {catalog.lastModified && (
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Last updated: {new Date(catalog.lastModified).toLocaleDateString()}
                                                </Text>
                                            )}
                                        </Space>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
                
                {catalogs.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '48px',
                        color: '#999'
                    }}>
                        <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                        <Title level={4} type="secondary">No catalogs found</Title>
                        <Text type="secondary">
                            No company catalogs are currently available.
                        </Text>
                    </div>
                )}
            </div>
        </List>
    );
}; 