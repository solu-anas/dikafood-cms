import React, { useState } from "react";
import { Create } from "@refinedev/antd";
import { useApiUrl } from "@refinedev/core";
import { 
  Upload, 
  Button, 
  Form, 
  Select, 
  Input, 
  Card, 
  Row, 
  Col, 
  message, 
  Progress,
  Typography,
  Space,
  Tag
} from "antd";
import { 
  UploadOutlined, 
  InboxOutlined, 
  FileImageOutlined,
  CheckCircleOutlined 
} from "@ant-design/icons";
import type { UploadProps } from 'antd/es/upload/interface';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Title, Text } = Typography;

const useTypes = [
    { value: "product-image", label: "Product Image" },
    { value: "brand-logo", label: "Brand Logo" },
    { value: "bank-logo", label: "Bank Logo" },
    { value: "bank-qrcode", label: "Bank QR Code" },
    { value: "bank-transfer", label: "Bank Transfer" },
    { value: "profile-picture", label: "Profile Picture" },
    { value: "catalog-image", label: "Catalog Image" },
    { value: "hero-image", label: "Hero Image" }
];

interface UploadResult {
  storageKey: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export const FileUpload: React.FC = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [category, setCategory] = useState<string>('general');
  
  const apiUrl = useApiUrl();

  const handleFormSubmit = (values: any) => {
    console.log('Form submitted:', { ...values, uploadResults });
    message.success(`Successfully uploaded ${uploadResults.length} file(s) to storage service!`);
    
    // Reset form and results
    form.resetFields();
    setUploadResults([]);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: `${apiUrl}/management/storage/upload`,
    headers: { 
      'X-Requested-With': 'XMLHttpRequest'
    },
    data: (file) => ({
      category: category,
      metadata: JSON.stringify({
        uploadedVia: 'cms-file-upload',
        originalName: file.name,
        description: form.getFieldValue('description') || '',
        tags: form.getFieldValue('tags') || []
      })
    }),
    withCredentials: true,
    onChange(info) {
      const { status } = info.file;
      
      if (status === 'uploading') {
        setUploading(true);
      }
      
      if (status === 'done') {
        const response = info.file.response;
        if (response?.success && response?.data) {
          const result: UploadResult = {
            storageKey: response.data.storageKey,
            url: response.data.url,
            thumbnailUrl: response.data.thumbnailUrl,
            mediumUrl: response.data.mediumUrl,
            originalName: response.data.originalName,
            size: response.data.size,
            mimeType: response.data.mimeType
          };
          
          setUploadResults(prev => [...prev, result]);
          message.success(`${info.file.name} uploaded to storage service successfully`);
        } else {
          message.error(`${info.file.name} upload failed: ${response?.message || 'Unknown error'}`);
        }
        
        // Check if all files are done uploading
        const allFiles = info.fileList;
        const pendingFiles = allFiles.filter(file => file.status === 'uploading');
        if (pendingFiles.length === 0) {
          setUploading(false);
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        setUploading(false);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Create 
      title="Upload Files to Storage Service"
      breadcrumb={false}
      headerProps={{
        subTitle: "Upload files to the centralized storage service with automatic image processing"
      }}
    >
      <Row gutter={24}>
        <Col span={16}>
          <Card 
            title={
              <Space>
                <FileImageOutlined />
                File Upload Configuration
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="File Category"
                    name="category"
                    rules={[{ required: true, message: 'Please select a file category' }]}
                    initialValue="general"
                  >
                    <Select 
                      options={useTypes}
                      onChange={setCategory}
                      placeholder="Select file category"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tags"
                    name="tags"
                  >
                    <Select
                      mode="tags"
                      placeholder="Add tags (optional)"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                label="Description"
                name="description"
              >
                <TextArea
                  rows={3}
                  placeholder="Optional description for the uploaded files"
                />
              </Form.Item>
            </Form>
          </Card>

          <Card title="File Upload Area">
            <Dragger {...uploadProps} disabled={!category}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag files to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for single or bulk upload. Files will be processed by the storage service 
                with automatic image optimization and variant generation.
              </p>
            </Dragger>
            
            {uploading && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Progress type="line" status="active" />
                <Text type="secondary">Uploading to storage service...</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card 
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Upload Results ({uploadResults.length})
              </Space>
            }
          >
            {uploadResults.length === 0 ? (
              <Text type="secondary">No files uploaded yet</Text>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {uploadResults.map((result, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text strong style={{ fontSize: '12px' }}>
                        {result.originalName}
                      </Text>
                      <div>
                        <Tag color="green" style={{ fontSize: '10px' }}>
                          Storage Key: {result.storageKey.substring(0, 8)}...
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Size: {(result.size / 1024).toFixed(1)} KB
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Type: {result.mimeType}
                      </Text>
                      {result.thumbnailUrl && (
                        <div style={{ textAlign: 'center' }}>
                          <img 
                            src={`${apiUrl}${result.thumbnailUrl}`}
                            alt="Preview"
                            style={{ 
                              maxWidth: '60px', 
                              maxHeight: '60px',
                              objectFit: 'contain',
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      )}
                    </Space>
                  </Card>
                ))}
              </Space>
            )}
          </Card>

          {uploadResults.length > 0 && (
            <Card style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                block 
                onClick={() => form.submit()}
                disabled={uploading}
              >
                Complete Upload Process
              </Button>
            </Card>
          )}
        </Col>
      </Row>
    </Create>
  );
};