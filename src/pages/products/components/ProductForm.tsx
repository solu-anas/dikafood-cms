import React, { useState, useEffect } from "react";
import { Form, Input, Select, Switch, Row, Col, InputNumber, Button, Card, Space, Modal, Image, Tooltip, message, Upload, Tabs } from "antd";
import { PlusOutlined, DeleteOutlined, PictureOutlined, UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { useApiUrl, useCustom } from "@refinedev/core";
import type { UploadProps } from 'antd/es/upload/interface';
import { apiGet, getProductImageUrlById } from '../../../utils/api';

const { TextArea } = Input;
const { Dragger } = Upload;

const SIZES = [
  { value: "500ML", label: "500ML" },
  { value: "1L", label: "1L" },
  { value: "2L", label: "2L" },
  { value: "5L", label: "5L" },
  { value: "10L", label: "10L" },
  { value: "25L", label: "25L" },
];

const CATEGORIES = [
  { value: "olive oil", label: "Olive Oil" },
  { value: "sunflower oil", label: "Sunflower Oil" },
];

interface Variant {
  size: string;
  price: number;
  stock: number;
  image: string;
}

interface GalleryImage {
  filename: string;
  storageKey?: string;
  path: string;
  thumbnailPath?: string;
  mediumPath?: string;
  size: string;
  brand: string;
  brandDisplayName: string;
  name: string;
  isGalleryImage?: boolean;
  isFillView?: boolean;
}

interface ProductFormProps {
  formProps: any;
  mode: string;
  brands?: { value: string; label: string }[];
  brandsLoading?: boolean;
  organized?: boolean;
  initialValues?: any;
}

// Add AsyncImage component for image preview
const AsyncImage: React.FC<{ imageId?: string; height?: number }> = ({ imageId = '', height = 60 }) => {
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
  return <Image src={src} height={height} style={{ objectFit: 'contain' }} preview />;
};

export const ProductForm: React.FC<ProductFormProps> = ({ formProps, mode, brands = [], brandsLoading = false, organized = false }) => {
  const { form } = formProps;
  const [variants, setVariants] = useState<Variant[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentVariantIndex, setCurrentVariantIndex] = useState<number>(0);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("");

  const apiUrl = useApiUrl();
  
  // Gallery images state
  const [galleryData, setGalleryData] = useState<any>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);
  useEffect(() => {
    const fetchGallery = async () => {
      setGalleryLoading(true);
      try {
        const token = localStorage.getItem("dikafood_access_token");
        const data = await apiGet(`${apiUrl}/admin/product-images/gallery`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Gallery data received:', data);
        setGalleryData(data);
      } catch (e) {
        console.error('Gallery fetch error:', e);
        setGalleryData(null);
      } finally {
        setGalleryLoading(false);
      }
    };
    fetchGallery();
  }, [apiUrl]);

  useEffect(() => {
    if (formProps.initialValues?.variants) {
      const transformedVariants = formProps.initialValues.variants.map((variant: any) => ({
        size: variant.size,
        price: variant.price,
        stock: variant.stock,
        image: typeof variant.image === 'object' 
          ? (variant.image?.filename || variant.image?.fileId || '')
          : (variant.image || '')
      }));
      setVariants(transformedVariants);
    } else if (mode === 'create') {
      setVariants([{ size: "1L", price: 0, stock: 0, image: "" }]);
    }
  }, [formProps.initialValues, mode, form]);

  const addVariant = () => {
    const newVariants = [...variants, { size: "1L", price: 0, stock: 0, image: "" }];
    setVariants(newVariants);
    form?.setFieldsValue({ variants: newVariants });
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
      form?.setFieldsValue({ variants: newVariants });
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
    form?.setFieldsValue({ variants: newVariants });
  };

  const openImageModal = (variantIndex: number) => {
    setCurrentVariantIndex(variantIndex);
    setImageModalVisible(true);
  };

  const selectImageFromGallery = (image: GalleryImage) => {
    // Always use storageKey for new system
    const imageValue = image.storageKey || '';
    updateVariant(currentVariantIndex, 'image', imageValue);
    form?.setFieldValue(['variants', currentVariantIndex, 'image'], imageValue);
    setImageModalVisible(false);
    message.success(`Image "${image.name}" selected for variant ${currentVariantIndex + 1}.`);
  };

  const getUploadProps = (variantIndex: number): UploadProps => ({
    name: 'image',
    action: `${apiUrl}/admin/product-images/upload`,
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem("dikafood_access_token")}`,
    },
    data: {
      brand: () => form?.getFieldValue('brand') || '',
      size: () => variants[variantIndex]?.size || '',
    },
    withCredentials: false,
    maxCount: 1,
    onChange(info) {
      if (info.file.status === 'done') {
        const response = info.file.response;
        if (response?.success && response?.data) {
          const imageData = response.data;
          const imageValue = imageData.storageKey;
          updateVariant(variantIndex, 'image', imageValue);
          form?.setFieldValue(['variants', variantIndex, 'image'], imageValue);
          message.success(`${info.file.name} uploaded successfully and assigned to variant ${variantIndex + 1}.`);
        } else {
          message.error(`${info.file.name} upload failed: ${response?.error?.message || 'Unknown error'}`);
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  });

  const galleryImages = galleryData?.data?.data || {};
  // Handle the case where gallery data might be a flat array or nested object
  let allImages: GalleryImage[] = [];
  
  if (galleryData?.data?.images && Array.isArray(galleryData.data.images)) {
    // If it's a flat array of images
    allImages = galleryData.data.images.map((img: any) => {
      // Extract brand and size from image ID (format: "brand-size")
      const idParts = img.id ? img.id.split('-') : [];
      const brand = idParts.length > 1 ? idParts.slice(0, -1).join('-') : '';
      const size = idParts.length > 1 ? idParts[idParts.length - 1] : '';
      
      return {
        filename: img.filename || img.id,
        storageKey: img.id,
        path: img.urls?.original || `/product-images/${img.id}`,
        thumbnailPath: img.urls?.thumbnail || `/product-images/${img.id}/thumbnail`,
        mediumPath: img.urls?.medium || `/product-images/${img.id}/medium`,
        size: size,
        brand: brand,
        brandDisplayName: brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '',
        name: `${brand} ${size}` || img.filename || img.id,
        isGalleryImage: true,
        isFillView: false,
      };
    });
  } else if (typeof galleryImages === 'object' && galleryImages !== null) {
    // If it's grouped by brand
    allImages = Object.values(galleryImages).flat() as GalleryImage[];
  }
  
  const filteredImages = selectedBrandFilter 
    ? allImages.filter(img => img.brand === selectedBrandFilter)
    : allImages;

  // Helper: Variant Image Picker UI
  const VariantImagePicker: React.FC<{ variantIndex: number; value: string; onChange: (val: string) => void; id?: string }> = ({ variantIndex, value, onChange, id }) => {
    const [tab, setTab] = useState<'upload' | 'gallery'>('upload');
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);

    // Upload handler
    const handleUpload = async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file, file.name);
        formData.append('brand', form?.getFieldValue('brand') || '');
        formData.append('size', variants[variantIndex]?.size || '');
        const token = localStorage.getItem("dikafood_access_token");
        const res = await fetch(`${apiUrl}/admin/product-images/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status}`);
        }
        const data = await res.json();
        if (data?.success && data?.data) {
          const imageData = data.data;
          const imageValue = imageData.storageKey;
          onChange(imageValue || '');
          setPreview(imageValue || '');
          message.success('Image uploaded successfully');
        } else {
          message.error('Upload failed: ' + (data?.error?.message || 'Unknown error'));
        }
      } catch (e: any) {
        message.error('Upload failed: ' + (e.message || 'Unknown error'));
      } finally {
        setUploading(false);
      }
    };

    return (
      <div>
        <Tabs activeKey={tab} onChange={k => setTab(k as 'upload' | 'gallery')} items={[
          {
            key: 'upload',
            label: 'Upload',
            children: (
              <Upload
                showUploadList={false}
                customRequest={({ file }) => handleUpload(file as File)}
                accept="image/*"
                disabled={uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploading} id={id}>Upload Image</Button>
              </Upload>
            )
          },
          {
            key: 'gallery',
            label: 'Gallery',
            children: (
              <Row gutter={[8,8]} style={{ maxHeight: 200, overflowY: 'auto' }}>
                {allImages.map(img => (
                  <Col key={img.storageKey} span={6}>
                    <Card
                      hoverable
                      onClick={async () => {
                        const imageValue = img.storageKey || '';
                        onChange(imageValue || '');
                        setPreview(imageValue || '');
                        message.success('Image selected from gallery');
                      }}
                      style={{ border: (value === img.storageKey) ? '2px solid #AACC00' : undefined }}
                      cover={
                        <AsyncImage imageId={img.storageKey || ''} height={60} />
                      }
                    >
                      <div style={{ fontSize: 11 }}>{img.name}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )
          }
        ]} />
        {preview && (
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <AsyncImage imageId={value || ''} height={60} />
            <Button 
              size="small" 
              style={{ marginTop: 4 }} 
              onClick={() => { onChange(''); setPreview(null); }}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Form {...formProps} layout="vertical" onFinish={formProps.onFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Brand"
            name="brand"
            rules={[{ required: true }]}
          >
            <Select options={brands} loading={brandsLoading} disabled={brandsLoading} />
          </Form.Item>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter product name' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please select a category' }]}> 
            <Select options={CATEGORIES} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Description" name="description" rules={[{ required: true, min: 10, message: 'Description must be at least 10 characters' }]}> 
            <TextArea rows={8} />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Featured" name="featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Product Variants</h3>
          <Button onClick={addVariant} icon={<PlusOutlined />} type="primary">
            Add Variant
          </Button>
        </div>
        
        {variants.map((variant, index) => (
          <div key={index} style={{ 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '16px', 
            position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Size" name={['variants', index, 'size']} rules={[{ required: true }]}> 
                  <Select options={SIZES} onChange={(value) => updateVariant(index, 'size', value)} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Price" name={['variants', index, 'price']} rules={[{ required: true }]}> 
                  <InputNumber min={0} style={{ width: '100%' }} onChange={(value) => updateVariant(index, 'price', value ?? 0)} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Stock" name={['variants', index, 'stock']} rules={[{ required: true }]}> 
                  <InputNumber min={0} style={{ width: '100%' }} onChange={(value) => updateVariant(index, 'stock', value ?? 0)} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Image" name={['variants', index, 'image']} rules={[{ required: true }]} id={`variants_${index}_image`}>
                  <VariantImagePicker
                    variantIndex={index}
                    value={variant.image}
                    onChange={val => updateVariant(index, 'image', val)}
                    id={`variants_${index}_image`}
                  />
                </Form.Item>
              </Col>
            </Row>
            {variants.length > 1 && (
              <Button 
                danger 
                onClick={() => removeVariant(index)} 
                icon={<DeleteOutlined />} 
                style={{ position: 'absolute', top: '16px', right: '16px' }} 
              />
            )}
          </div>
        ))}
      </div>
      
      <Modal open={imageModalVisible} onCancel={() => setImageModalVisible(false)} footer={null} width="80vw">
        <Select placeholder="Filter by brand..." style={{ width: 200, marginBottom: 16 }} onChange={setSelectedBrandFilter} allowClear options={brands} />
        <Row gutter={[16, 16]}>
          {filteredImages.map((image) => (
            <Col key={image.storageKey || image.filename} span={4}>
              <Card hoverable onClick={() => selectImageFromGallery(image)}>
                <AsyncImage imageId={image.storageKey || ''} height={100} />
                <Card.Meta 
                  title={image.name} 
                  description={
                    <div>
                      <div>{image.size}</div>
                      {image.isGalleryImage && <div style={{ color: '#52c41a', fontSize: '11px' }}>✓ Storage Service</div>}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </Form>
  );
};