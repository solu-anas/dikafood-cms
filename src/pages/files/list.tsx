import React, { useState } from "react";
import {
  useTable,
  DateField,
  FilterDropdown,
} from "@refinedev/antd";
import { 
  Table,
  Card,
  Statistic,
  Row,
  Col,
  Space,
  Avatar,
  Tooltip,
  Image,
  Button,
  Select, 
  Input, 
  Tag,
  Typography,
  Alert,
  Spin
} from "antd";
import { 
  SearchOutlined, 
  FileImageOutlined, 
  FilePdfOutlined,
  BankOutlined,
  ShoppingOutlined,
  CarOutlined,
  FileOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  CrownOutlined,
  QrcodeOutlined,
  TransactionOutlined,
  UserOutlined,
  PictureOutlined,
  StarOutlined
} from "@ant-design/icons";
import { useNavigation } from "../../hooks/useNavigation";
import { getErrorMessage } from "../../utils/error";
import feedback from "../../utils/feedback";

const { Text } = Typography;

export const FileList: React.FC = () => {
  const navigate = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { tableProps, tableQueryResult } = useTable({
    resource: "files",
    syncWithLocation: true,
  });
  const { isLoading, isError, error } = tableQueryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert {...feedback.alertProps("error", "Error", error)} />;

  const getUseCaseIcon = (useCase: string, isStorageService: boolean = false) => {
    const baseIcon = (() => {
      switch (useCase) {
        case 'product-media': 
        case 'product-image': return <ShoppingOutlined />;
        case 'brand-logo': return <CrownOutlined />;
        case 'bank-logo': return <BankOutlined />;
        case 'bank-qrcode': return <QrcodeOutlined />;
        case 'bank-transfer': return <TransactionOutlined />;
        case 'profile-picture': return <UserOutlined />;
        case 'catalog-image': return <PictureOutlined />;
        case 'hero-image': return <StarOutlined />;
        default: return <FileOutlined />;
      }
    })();

    return (
      <span style={{ position: 'relative' }}>
        {baseIcon}
        {isStorageService && (
          <span 
            style={{ 
              position: 'absolute', 
              top: '-2px', 
              right: '-2px', 
              width: '6px', 
              height: '6px', 
              backgroundColor: '#52c41a', 
              borderRadius: '50%',
              border: '1px solid white'
            }} 
            title="Storage Service"
          />
        )}
      </span>
    );
  };

  const getUseCaseColor = (useCase: string) => {
    switch (useCase) {
      case 'product-media':
      case 'product-image': return '#52c41a';
      case 'brand-logo': return '#1890ff';
      case 'bank-logo': return '#fa8c16';
      case 'bank-qrcode': return '#722ed1';
      case 'bank-transfer': return '#722ed1';
      case 'profile-picture': return '#13c2c2';
      case 'catalog-image': return '#eb2f96';
      case 'hero-image': return '#fa8c16';
      default: return '#666';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (fileType: string) => {
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileType?.toLowerCase());
  };

  // Filter data based on active filter
  const getFilteredData = () => {
    if (!tableProps.dataSource) return [];
    
    switch (activeFilter) {
      case 'product-media':
        return tableProps.dataSource.filter((item: any) => item.data?.useCase === 'product-media');
      case 'brand-assets':
        return tableProps.dataSource.filter((item: any) => ['brand-logo', 'blog-image'].includes(item.data?.useCase));
      case 'bank-materials':
        return tableProps.dataSource.filter((item: any) => ['bank-logo', 'bank-qrcode'].includes(item.data?.useCase));
      case 'delivery-assets':
        return tableProps.dataSource.filter((item: any) => item.data?.useCase === 'delivery-logo');
      case 'images':
        return tableProps.dataSource.filter((item: any) => isImageFile(item.data?.fileType));
      case 'documents':
        return tableProps.dataSource.filter((item: any) => !isImageFile(item.data?.fileType));
      default:
        return tableProps.dataSource;
    }
  };

  const filteredData = getFilteredData();
  const totalFiles = tableProps.dataSource?.length || 0;
  const productMedia = tableProps.dataSource?.filter((item: any) => item.data?.useCase === 'product-media').length || 0;
  const brandAssets = tableProps.dataSource?.filter((item: any) => ['brand-logo', 'blog-image'].includes(item.data?.useCase)).length || 0;
  const bankMaterials = tableProps.dataSource?.filter((item: any) => ['bank-logo', 'bank-qrcode'].includes(item.data?.useCase)).length || 0;
  const deliveryAssets = tableProps.dataSource?.filter((item: any) => item.data?.useCase === 'delivery-logo').length || 0;
  const totalSize = tableProps.dataSource?.reduce((acc: number, item: any) => acc + (item.data?.fileSize || 0), 0) || 0;

  const statusFilters = [
    { key: 'all', label: 'All Files', icon: <FileOutlined />, count: totalFiles },
    { key: 'product-media', label: 'Product Media', icon: <ShoppingOutlined />, count: productMedia },
    { key: 'brand-assets', label: 'Brand Assets', icon: <FileImageOutlined />, count: brandAssets },
    { key: 'bank-materials', label: 'Bank Materials', icon: <BankOutlined />, count: bankMaterials },
    { key: 'delivery-assets', label: 'Delivery Assets', icon: <CarOutlined />, count: deliveryAssets },
  ];

  const columns = [
    {
      dataIndex: ["data", "fileName"],
      title: "File",
      render: (value: string, record: any) => {
        const isStorageService = !!(record.storageKey || record.data?.storageKey);
        const fileName = value || record.data?.originalName || record.originalName || 'Untitled';
        const fileType = record.data?.fileType || record.fileType || '';
        const fileSize = record.data?.fileSize || record.size || 0;
        const useCase = record.data?.useCase || record.category || 'general';
        
        // Determine image source based on storage type
        let imageSrc = '/images/placeholder-file.png';
        if (isImageFile(fileType)) {
          if (isStorageService) {
            // Use storage service URL with thumbnail variant
            const storageKey = record.storageKey || record.data?.storageKey;
            imageSrc = `/storage/files/${storageKey}?variant=thumbnail`;
          } else {
            // Legacy files without storage service - show placeholder
            imageSrc = '/images/placeholder-file.png';
          }
        }

        return (
          <Space>
            {isImageFile(fileType) ? (
              <Image
                width={40}
                height={40}
                src={imageSrc}
                fallback="/images/placeholder-file.png"
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            ) : (
              <Avatar 
                icon={fileType === 'pdf' ? <FilePdfOutlined /> : <FileOutlined />}
                style={{ 
                  backgroundColor: getUseCaseColor(useCase),
                }}
              />
            )}
            <div>
              <div style={{ fontWeight: 'bold', maxWidth: '200px', color: 'var(--text-primary)' }}>
                {fileName}
                {isStorageService && (
                  <Tag 
                    color="green" 
                    style={{ marginLeft: '8px', fontSize: '10px' }}
                    title="Stored in Storage Service"
                  >
                    Storage Service
                  </Tag>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {fileType?.toUpperCase()} • {formatFileSize(fileSize)}
                {isStorageService && (
                  <span style={{ color: '#52c41a', marginLeft: '8px' }}>
                    ✓ Optimized
                  </span>
                )}
              </div>
            </div>
          </Space>
        );
      },
      sorter: true,
      filterDropdown: (props: any) => (
        <FilterDropdown {...props}>
          <Input
            placeholder="Search filename"
            prefix={<SearchOutlined />}
          />
        </FilterDropdown>
      ),
    },
    {
      dataIndex: ["data", "useCase"],
      title: "Type",
      render: (value: string, record: any) => {
        const isStorageService = !!(record.storageKey || record.data?.storageKey);
        const useCase = value || record.category || 'general';
        
        return (
          <Tag
            color={getUseCaseColor(useCase)}
            icon={getUseCaseIcon(useCase, isStorageService)}
          >
            {useCase?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      },
      filterDropdown: (props: any) => (
        <FilterDropdown {...props}>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by type"
            allowClear
          >
            <Select.Option value="product-media">Product Media</Select.Option>
            <Select.Option value="product-image">Product Image</Select.Option>
            <Select.Option value="brand-logo">Brand Logo</Select.Option>
            <Select.Option value="bank-logo">Bank Logo</Select.Option>
            <Select.Option value="bank-qrcode">Bank QR Code</Select.Option>
            <Select.Option value="bank-transfer">Bank Transfer</Select.Option>
            <Select.Option value="profile-picture">Profile Picture</Select.Option>
            <Select.Option value="catalog-image">Catalog Image</Select.Option>
            <Select.Option value="hero-image">Hero Image</Select.Option>
          </Select>
        </FilterDropdown>
      ),
    },
    {
      dataIndex: "createdAt",
      title: "Uploaded",
      render: (value: string) => (
        <DateField value={value} format="MMM DD, YYYY" style={{ color: 'var(--text-secondary)' }} />
      ),
      sorter: true,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: any) => (
            <Space>
          <Tooltip title="Preview">
                              <Button 
              type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                const isStorageService = !!(record.storageKey || record.data?.storageKey);
                if (isStorageService) {
                  const storageKey = record.storageKey || record.data?.storageKey;
                  const fileUrl = `/storage/files/${storageKey}`;
                  window.open(fileUrl, '_blank');
                } else {
                  // Legacy files - show message that they need migration
                  alert('This file needs to be migrated to the storage service. Please contact administrator.');
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Download">
              <Button 
              type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => {
                const isStorageService = !!(record.storageKey || record.data?.storageKey);
                if (isStorageService) {
                  const storageKey = record.storageKey || record.data?.storageKey;
                  const fileUrl = `/storage/files/${storageKey}`;
                  const link = document.createElement('a');
                  link.href = fileUrl;
                  link.download = record.data?.fileName || record.originalName || 'file';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  // Legacy files - show message that they need migration
                  alert('This file needs to be migrated to the storage service. Please contact administrator.');
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                // Handle delete
                console.log('Delete file:', record.id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <style>{`
        .ant-table-cell {
          padding-top: 16px !important;
          padding-bottom: 16px !important;
          position: relative;
        }
        .ant-table-cell:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          height: 50%;
          width: 1px;
          background-color: rgba(255, 255, 255, 0.08);
        }
        .ant-table-thead > tr > th {
          text-align: left !important;
        }
      `}</style>

      {/* Page Header */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
        paddingBottom: '24px',
        marginBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 700,
          margin: 0,
          color: 'var(--text-primary)'
        }}>
          Files Management
        </h1>
        
        {/* Status Filters and Actions Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%' 
        }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {statusFilters.map(filter => (
              <Button 
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                type="default"
                className="icon-text-separator"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '36px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: activeFilter === filter.key 
                    ? 'rgba(24, 144, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: activeFilter === filter.key 
                    ? 'rgba(24, 144, 255, 0.3)' 
                    : 'rgba(255, 255, 255, 0.15)',
                  color: activeFilter === filter.key 
                    ? '#1890ff' 
                    : 'var(--text-tertiary)',
                }}
                icon={filter.icon}
              >
                <span style={{ marginLeft: '6px' }}>{filter.label}</span>
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: activeFilter === filter.key 
                    ? 'rgba(0,0,0,0.125)' 
                    : 'rgba(255,255,255,0.1)',
                  color: activeFilter === filter.key 
                    ? '#1890ff' 
                    : 'var(--text-tertiary)',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={() => navigate.create('files')}
              className="icon-text-separator"
            >
              Upload File
            </Button>
          </div>
        </div>
      </div>

      {/* Header Stats */}
      <Card style={{ marginBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <Row gutter={16}>
          <Col span={4}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)' }}>Total Files</span>}
              value={totalFiles}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)' }}>Product Media</span>}
              value={productMedia}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)' }}>Brand Assets</span>}
              value={brandAssets}
              prefix={<FileImageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)' }}>Bank Materials</span>}
              value={bankMaterials}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)' }}>Delivery Assets</span>}
              value={deliveryAssets}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)' }}>Total Size</span>}
              value={totalSize}
              formatter={(value) => formatFileSize(value as number)}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>

      <Table 
        {...tableProps}
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          total: filteredData.length,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} files`,
        }}
      />
    </div>
  );
}; 