import React, { useState, useMemo, useEffect } from "react";
import { useTable, List, DeleteButton, useModalForm } from "@refinedev/antd";
import { useUpdate } from "@refinedev/core";
import { Table, Space, Typography, Tag, Tooltip, Button, Select, Avatar, Image, Modal, Dropdown, Menu, message, Alert, Spin } from "antd";
import { DeleteOutlined, ShoppingOutlined, EditOutlined, PlusOutlined, EyeOutlined, CheckCircleOutlined, StopOutlined, StarOutlined, AppstoreOutlined, CloseOutlined, ExpandOutlined, MoreOutlined, CopyOutlined, ExportOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { BaseRecord } from "@refinedev/core";
import { formatMAD } from "../../providers/dataProvider";
import { API_BASE_URL } from "../../config/api";
import { ProductForm } from "./components/ProductForm";
import { ProductShowModal } from "./components/ProductShowModal";
import { useSearchParams } from "react-router";
import feedback from "../../utils/feedback";
import { getProductImageUrlById, apiPost, apiPut, apiDelete } from '../../utils/api';

const { Text: AntText } = Typography;

// Custom Status Tag Component
export const StatusTag: React.FC<{
  type: 'active' | 'featured' | 'inactive' | 'deleted';
  children: React.ReactNode;
}> = ({ type, children }) => {
  const getTagStyles = () => {
    const baseStyles = {
      fontWeight: 500,
      border: 'none',
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      lineHeight: '16px'
    };

    switch (type) {
      case 'active':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(82, 196, 26, 0.3)',
        };
      case 'featured':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(250, 173, 20, 0.3)',
        };
      case 'inactive':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(255, 77, 79, 0.15)',
        };
      case 'deleted':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(255, 77, 79, 0.3)',
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'active':
        return <CheckCircleOutlined style={{ fontSize: '10px' }} />;
      case 'featured':
        return <StarOutlined style={{ fontSize: '10px' }} />;
      case 'inactive':
        return <StopOutlined style={{ fontSize: '10px' }} />;
      case 'deleted':
        return <DeleteOutlined style={{ fontSize: '10px' }} />;
      default:
        return null;
    }
  };

  return (
    <span style={getTagStyles()}>
      {getIcon()}
      {children}
    </span>
  );
};

// Helper components defined first
const TruncatedText: React.FC<{ text: string; maxLength?: number; style?: React.CSSProperties; strong?: boolean; }> = ({ text, maxLength = 30, style, strong = false }) => {
  if (!text) return <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>-</span>;
  const truncated = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  const needsTooltip = text.length > maxLength;
  const textElement = <span style={{ fontFamily: 'var(--font-body)', fontWeight: strong ? 500 : 400, ...style }}>{truncated}</span>;
  return needsTooltip ? <Tooltip title={text} placement="topLeft">{textElement}</Tooltip> : textElement;
};

// Add AsyncImage component for image preview
const AsyncImage: React.FC<{ imageId?: string; height?: number; width?: number }> = ({ imageId = '', height = 36, width = 36 }) => {
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
  if (!src) return <Avatar shape="square" size={width} icon={<ShoppingOutlined />} style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: 'rgba(255, 255, 255, 0.65)' }} />;
  return <Image src={src} width={width} height={height} style={{ objectFit: 'cover', borderRadius: '3px' }} preview={false} crossOrigin="anonymous" />;
};

const VariantSelector: React.FC<{
  productId: string;
  variants: any[];
  productName: string;
  selectedVariantIndex: number;
  onVariantChange: (index: number) => void;
  onImageClick: () => void;
  brandDisplayName?: string;
  category?: string;
}> = ({ productId, variants, productName, selectedVariantIndex, onVariantChange, onImageClick, brandDisplayName, category }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!variants || variants.length === 0) {
    return <div>No variants</div>;
  }

  const currentVariant = variants[selectedVariantIndex];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: 40,
          height: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onImageClick}
      >
        {isHovered ? (
          <ExpandOutlined
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.85)'
            }}
          />
        ) : (
          <>
            <AsyncImage imageId={currentVariant.image} width={36} height={36} />
          </>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <AntText strong>{productName}</AntText>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: '4px', fontSize: '12px', color: '#b0b0b0', fontFamily: 'var(--font-body)', fontWeight: 400 }}>
          <span>{brandDisplayName}</span>
          <span style={{ margin: '0 8px', color: '#b0b0b0' }}>—</span>
          <span>{category || 'Uncategorized'}</span>
        </div>
        {variants.length > 1 ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '6px',
            width: 'auto',
            flexWrap: 'wrap'
          }}>
            {variants.map((v, i) => (
              <Button
                key={v.size || i}
                type={selectedVariantIndex === i ? 'primary' : 'text'}
                size="small"
                style={{
                  minWidth: 0,
                  padding: '2px 10px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  background: selectedVariantIndex === i ? '#AACC00' : 'transparent',
                  color: selectedVariantIndex === i ? '#222' : 'rgba(255,255,255,0.85)',
                  border: selectedVariantIndex === i ? '1px solid #AACC00' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  boxShadow: selectedVariantIndex === i ? '0 0 0 1.5px rgba(170, 204, 0, 0.2)' : 'none',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
                onClick={() => onVariantChange(i)}
              >
                {v.size}
              </Button>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>{currentVariant?.size}</div>
        )}
      </div>
    </div>
  );
};

const EditProductModal = ({ recordId, onClose, onSuccess }: { recordId: string; onClose: () => void; onSuccess?: () => void; }) => {
  const { modalProps, formProps, onFinish, queryResult } = useModalForm({
    id: recordId,
    action: "edit",
    resource: "products",
    redirect: false,
    onMutationSuccess: () => {
      onClose();
    },
    defaultVisible: true,
  });

  const record = queryResult?.data?.data;
  // Fetch brands only when modal is open
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (modalProps.open) {
      setBrandsLoading(true);
      fetch(`http://localhost:3000/api/products/brands`)
        .then(res => res.json())
        .then(data => setBrands((data.data?.brands || []).map((b: string) => ({ value: b, label: b.charAt(0).toUpperCase() + b.slice(1) }))))
        .finally(() => setBrandsLoading(false));
    }
  }, [modalProps.open]);

  // Custom onFinish for edit: update product, then diff and sync variants
  const handleEditFinish = async (values: any) => {
    console.log('🔧 Starting variant edit process...', values);
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Update product fields (excluding variants)
      const { variants: editedVariants, ...productFields } = values;
      console.log('📝 Product fields to update:', productFields);
      console.log('🔄 Original variants:', record?.variants);
      console.log('🔄 Edited variants:', editedVariants);
      
      await onFinish(productFields); // This calls the dataProvider.update for product

      // 2. Diff variants with proper error handling
      const originalVariants = record?.variants || [];
      const edited = editedVariants || [];
      
      console.log('📊 Variant comparison:', { originalCount: originalVariants.length, editedCount: edited.length });
      
      // Create maps using _id as the primary key
      const origById = new Map(originalVariants.map((v: any) => [v._id, v]));
      const editById = new Map(edited.filter((v: any) => v._id).map((v: any) => [v._id, v]));
      
      // Find operations
      const deleted = originalVariants.filter((v: any) => v._id && !editById.has(v._id));
      const added = edited.filter((v: any) => !v._id);
      const updated = edited.filter((v: any) => {
        if (!v._id) return false;
        const original = origById.get(v._id);
        if (!original) return false;
        const isUpdated = JSON.stringify(original) !== JSON.stringify(v);
        if (isUpdated) {
          console.log('🔍 Variant changed:', { original, updated: v });
        }
        return isUpdated;
      });

      console.log('📋 Operations to perform:', {
        added: added.length,
        updated: updated.length,
        deleted: deleted.length,
        addedVariants: added,
        updatedVariants: updated,
        deletedVariants: deleted
      });

      // 3. Execute variant operations with proper error handling
      const productId = recordId;
      const errors: string[] = [];

      // Add new variants
      for (const v of added) {
        try {
          console.log(`➕ Adding variant:`, v);
          const response = await apiPost(`/api/admin/products/${productId}/variants`, v);
          console.log(`✅ Variant added successfully:`, response);
        } catch (err: any) {
          console.error(`❌ Add variant error:`, err);
          const errorMessage = err.response?.data?.message || err.message || 'Network error';
          errors.push(`Failed to add variant (${v.size}): ${errorMessage}`);
        }
      }

      // Update existing variants
      for (const v of updated) {
        try {
          console.log(`🔄 Updating variant:`, v);
          const response = await apiPut(`/api/admin/products/${productId}/variants/${v._id}`, v);
          console.log(`✅ Variant updated successfully:`, response);
        } catch (err: any) {
          console.error(`❌ Update variant error:`, err);
          const errorMessage = err.response?.data?.message || err.message || 'Network error';
          errors.push(`Failed to update variant (${v.size}): ${errorMessage}`);
        }
      }

      // Delete removed variants
      for (const v of deleted) {
        try {
          console.log(`🗑️ Deleting variant:`, v);
          const response = await apiDelete(`/api/admin/products/${productId}/variants/${v._id}`);
          console.log(`✅ Variant deleted successfully:`, response);
        } catch (err: any) {
          console.error(`❌ Delete variant error:`, err);
          const errorMessage = err.response?.data?.message || err.message || 'Network error';
          errors.push(`Failed to delete variant (${v.size}): ${errorMessage}`);
        }
      }

      console.log('🏁 Variant operations completed:', { errors });

      if (errors.length > 0) {
        setError(`Product updated but some variant operations failed:\n${errors.join('\n')}`);
      } else {
        setSuccess("Product and variants updated successfully.");
        // Call the success callback to refresh data
        if (onSuccess) {
          console.log('🔄 Calling success callback to refresh data...');
          onSuccess();
        }
        onClose();
      }
    } catch (e: any) {
      setError(e.message || "Error updating product/variants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      {...modalProps}
      onOk={() => formProps.form?.submit()}
      width={1000}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
      styles={{
        body: {
          padding: '24px',
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
            <EditOutlined style={{
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
              Edit Product
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
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      {success && <Alert type="success" message={success} showIcon style={{ marginBottom: 16 }} />}
      <ProductForm
        formProps={{ ...formProps, onFinish: handleEditFinish }}
        mode="edit"
        brands={brands}
        brandsLoading={brandsLoading}
        initialValues={record}
      />
      {loading && <Spin style={{ marginTop: 16 }} />}
    </Modal>
  );
};

const ActionConfirmationModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  okText: string;
  cancelText: string;
  okType: 'primary' | 'danger';
  icon: React.ReactNode;
}> = ({
  visible,
  onClose,
  onConfirm,
  title,
  subtitle,
  content,
  okText,
  cancelText,
  okType,
  icon
}) => {
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={450}
        centered
        closable={false}
        styles={{
          body: {
            padding: '0px',
            backgroundColor: '#2d2d2d',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.65)' },
        }}
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {icon}
          <div>
            <Typography.Title level={5} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>{title}</Typography.Title>
            <Typography.Text style={{ color: 'var(--text-tertiary)' }}>{subtitle}</Typography.Text>
          </div>
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          lineHeight: '20px',
          padding: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          textAlign: 'center'
        }}>
          {content}
        </div>
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          <Button onClick={onClose} style={{ minWidth: '80px' }}>
            {cancelText}
          </Button>
          <Button
            type={okType === 'primary' ? 'primary' : 'default'}
            danger={okType === 'danger'}
            onClick={onConfirm}
            style={{ minWidth: '80px' }}
          >
            {okText}
          </Button>
        </div>
      </Modal>
    );
  };

// Main component
export const ProductList: React.FC = () => {
  const { tableProps, tableQueryResult } = useTable({
    resource: "products",
    syncWithLocation: true
  });
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [showModalVisible, setShowModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const { mutate } = useUpdate();
  const [confirmationModalState, setConfirmationModalState] = useState<{
    visible: boolean;
    record: BaseRecord | null;
    action: 'toggleActive' | 'toggleFeatured' | 'delete' | null;
  }>({ visible: false, record: null, action: null });

  const { modalProps: createModalProps, formProps: createFormProps, show: showCreateModal, onFinish: onCreateFinish } = useModalForm({
    action: "create",
    resource: "products",
    redirect: false,
    syncWithLocation: true
  });

  const handleShowModal = (id: string) => {
    setSelectedProductId(id);
    setShowModalVisible(true);
  };
  const handleCloseShowModal = () => {
    setSelectedProductId("");
    setShowModalVisible(false);
  };

  const handleCreateFormFinish = async (values: any) => {
    try {
      // Store only the image storageKey/UUID in the variant
      const variants = (values.variants || []).map((v: any) => ({
        ...v,
        image: v.image,
        price: Number(v.price),
        stock: Number(v.stock)
      }));
      const { brandDisplayName, ...rest } = values;
      const formattedValues = {
        ...rest,
        variants
      };
      await onCreateFinish(formattedValues);
      setCreateModalVisible(false);
      if (tableProps && typeof (tableProps as any).refresh === 'function') {
        (tableProps as any).refresh();
      } else if (tableProps && typeof tableProps.onChange === 'function') {
        if (tableProps.pagination && typeof tableProps.onChange === 'function') {
          tableProps.onChange(
            tableProps.pagination,
            {},
            {},
            { currentDataSource: [], action: 'paginate' }
          );
        }
      }
    } catch (err) {
      // Error already shown per variant
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!confirmationModalState.record) return;
    const record = confirmationModalState.record;
    const newActiveState = !record.active;
    try {
      await mutate({
        resource: 'products',
        id: record._id,
        values: { active: newActiveState },
      });
      message.success(
        newActiveState ? 'Product activated successfully' : 'Product suspended successfully'
      );
    } catch (error) {
      message.error(
        newActiveState ? 'Failed to activate product' : 'Failed to suspend product'
      );
    } finally {
      setConfirmationModalState({ visible: false, record: null, action: null });
    }
  };

  const handleConfirmToggleFeatured = async () => {
    if (!confirmationModalState.record) return;
    const record = confirmationModalState.record;
    const newFeaturedState = !record.featured;
    try {
      await mutate({
        resource: 'products',
        id: record._id,
        values: { featured: newFeaturedState },
      });
      message.success(
        newFeaturedState ? 'Product marked as featured' : 'Product removed from featured'
      );
    } catch (error) {
      message.error(
        newFeaturedState ? 'Failed to mark as featured' : 'Failed to remove from featured'
      );
    } finally {
      setConfirmationModalState({ visible: false, record: null, action: null });
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmationModalState.record) return;
    const record = confirmationModalState.record;
    try {
      await mutate({
        resource: 'products',
        id: record._id,
        values: { deleted: true, active: false },
      });
      message.success('Product deleted (soft) successfully');
    } catch (error) {
      message.error('Failed to delete product');
    } finally {
      setConfirmationModalState({ visible: false, record: null, action: null });
    }
  };

  const filteredData = useMemo(() => {
    if (!tableProps.dataSource) return [];

    switch (activeStatusFilter) {
      case "active":
        return tableProps.dataSource.filter((p) => p.active);
      case "suspended":
        return tableProps.dataSource.filter((p) => !p.active);
      case "featured":
        return tableProps.dataSource.filter((p) => p.featured);
      default:
        return tableProps.dataSource;
    }
  }, [tableProps.dataSource, activeStatusFilter]);

  const statusFilters = useMemo(() => [
    { key: "all", label: "All", icon: <AppstoreOutlined />, color: "#1890ff", count: tableProps.dataSource?.length || 0 },
    { key: "active", label: "Active", icon: <CheckCircleOutlined />, color: "#52c41a", count: tableProps.dataSource?.filter((p) => p.active).length || 0 },
    { key: "suspended", label: "Suspended", icon: <StopOutlined />, color: "#faad14", count: tableProps.dataSource?.filter((p) => !p.active).length || 0 },
    { key: "featured", label: "Featured", icon: <StarOutlined />, color: "#f7b731", count: tableProps.dataSource?.filter((p) => p.featured).length || 0 },
  ], [tableProps.dataSource]);

  const [searchParams] = useSearchParams();
  const highlightedProductId = searchParams.get("highlight");

  // Debug log for error
  console.log("ProductList error:", tableQueryResult.error);

  // Fetch brands for create modal
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  useEffect(() => {
    if (createModalProps.open) {
      setBrandsLoading(true);
      fetch(`http://localhost:3000/api/products/brands`)
        .then(res => res.json())
        .then(data => setBrands((data.data?.brands || []).map((b: string) => ({ value: b, label: b.charAt(0).toUpperCase() + b.slice(1) }))))
        .finally(() => setBrandsLoading(false));
    }
  }, [createModalProps.open]);

  // Function to refresh table data
  const refreshTable = () => {
    console.log('🔄 Refreshing table data...');
    if (tableQueryResult.refetch) {
      tableQueryResult.refetch();
    }
  };

  if (tableQueryResult.isLoading) return <Spin />;
  if (tableQueryResult.isError) return <Alert {...feedback.alertProps("error", "Error", tableQueryResult.error)} />;

  return (
    <>
      <style>
        {`
          .highlighted-row {
            background-color: rgba(170, 204, 0, 0.2);
            animation: highlight-fade 2.5s ease-in-out forwards;
          }

          @keyframes highlight-fade {
            from {
              background-color: rgba(170, 204, 0, 0.3);
            }
            to {
              background-color: transparent;
            }
          }
        `}
      </style>
      <Modal
        {...createModalProps}
        onOk={() => createFormProps.form?.submit()}
        width={1000}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
        styles={{
          body: {
            padding: '24px',
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
              <PlusOutlined style={{
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
                Create New Product
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '18px',
                marginTop: '2px'
              }}>
                Add a new item to your inventory
              </div>
            </div>
          </div>
        }
      >
        <ProductForm formProps={{ ...createFormProps, onFinish: handleCreateFormFinish }} mode="create" brands={brands} brandsLoading={brandsLoading} />
      </Modal>

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
          Products
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {statusFilters.map(filter => (
              <Button
                key={filter.key}
                onClick={() => setActiveStatusFilter(filter.key)}
                type="default"
                className="icon-text-separator"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '36px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: activeStatusFilter === filter.key ? filter.color + '26' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: activeStatusFilter === filter.key ? filter.color + '4D' : 'rgba(255, 255, 255, 0.15)',
                  color: activeStatusFilter === filter.key ? filter.color : 'rgba(255, 255, 255, 0.75)',
                  transition: '0.2s',
                  boxShadow: activeStatusFilter === filter.key ? `0 0 0 2px ${filter.color}26` : 'none'
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
                  backgroundColor: activeStatusFilter === filter.key ? 'rgba(0,0,0,0.125)' : 'rgba(255,255,255,0.1)',
                  color: activeStatusFilter === filter.key ? filter.color : 'rgba(255, 255, 255, 0.65)',
                  minWidth: '20px',
                  textAlign: 'center',
                  border: activeStatusFilter === filter.key ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)'
                }}>
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
          <Button type="primary" onClick={() => showCreateModal()} icon={<PlusOutlined />}>
            Create Product
          </Button>
        </div>
      </div>

      <style>{`
        .products-table .ant-table-cell {
          padding-top: 16px !important;
          padding-bottom: 16px !important;
          position: relative;
        }
        .products-table .ant-table-cell:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          height: 50%;
          width: 1px;
          background-color: rgba(255, 255, 255, 0.08);
        }
        .products-table .ant-table-thead > tr > th {
          text-align: left !important;
        }
        .ant-table-measure-row {
          display: none !important;
        }
      `}</style>

      <Table
        {...tableProps}
        dataSource={filteredData}
        rowKey="_id"
        className="products-table"
        tableLayout="auto"
        size="middle"
        bordered={false}
        pagination={{
          ...tableProps.pagination,
          showTotal: (total, range) => (
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {range[0]}-{range[1]} of {total} products
            </span>
          ),
          pageSizeOptions: ["10", "20", "50", "100"],
          showSizeChanger: true,
          style: { fontFamily: 'var(--font-body)' }
        }}
        rowClassName={(record) => record._id === highlightedProductId ? 'highlighted-row' : ''}
      >
        <Table.Column
          title="#"
          dataIndex="serialNumber"
          width={80}
          render={(value) => <AntText code style={{ fontSize: '12px' }}>{value}</AntText>}
        />
        <Table.Column
          title="Product"
          key="product"
          width={300}
          render={(_, record: BaseRecord) => {
            const selectedIndex = selectedVariants[record._id] || 0;
            // Capitalize brand for display
            const brandDisplay = record.brand ? record.brand.charAt(0).toUpperCase() + record.brand.slice(1) : 'Unknown';
            return (
              <VariantSelector
                productId={record._id}
                variants={record.variants}
                productName={record.name}
                selectedVariantIndex={selectedIndex}
                onVariantChange={(index) => setSelectedVariants(prev => ({ ...prev, [record._id]: index }))}
                onImageClick={() => handleShowModal(record._id)}
                brandDisplayName={brandDisplay}
                category={record.category}
              />
            );
          }}
        />
        <Table.Column
          title="Description"
          dataIndex="description"
          key="description"
          width={160}
          render={(value) => (
            <AntText
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '13px',
                lineHeight: '18px',
                maxWidth: 150,
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                verticalAlign: 'top',
              }}
              ellipsis={{ tooltip: value || 'No description available' }}
            >
              {value || 'No description available'}
            </AntText>
          )}
        />
        <Table.Column
          title="Price"
          key="price"
          dataIndex="price"
          width={120}
          sorter={(a, b) => {
            const aIndex = selectedVariants[a._id] || 0;
            const bIndex = selectedVariants[b._id] || 0;
            const aPrice = a.variants?.[aIndex]?.price || 0;
            const bPrice = b.variants?.[bIndex]?.price || 0;
            return aPrice - bPrice;
          }}
          render={(_, record: BaseRecord) => {
            const selectedIndex = selectedVariants[record._id] || 0;
            const price = record.variants?.[selectedIndex]?.price;
            return price !== undefined ? (
              <AntText strong style={{ color: '#AACC00', fontSize: '14px' }}>
                {formatMAD(price)}
              </AntText>
            ) : (
              <AntText type="secondary">-</AntText>
            );
          }}
        />
        <Table.Column
          title="Stock"
          key="stock"
          dataIndex="stock"
          width={100}
          sorter={(a, b) => {
            const aIndex = selectedVariants[a._id] || 0;
            const bIndex = selectedVariants[b._id] || 0;
            const aStock = a.variants?.[aIndex]?.stock || 0;
            const bStock = b.variants?.[bIndex]?.stock || 0;
            return aStock - bStock;
          }}
          render={(_, record: BaseRecord) => {
            const selectedIndex = selectedVariants[record._id] || 0;
            const stock = record.variants?.[selectedIndex]?.stock;
            return stock !== undefined ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AntText
                  strong
                  style={{
                    color: stock === 0 ? '#ff4d4f' : stock < 5 ? '#faad14' : '#52c41a',
                    fontSize: '14px'
                  }}
                >
                  {stock}
                </AntText>
                <AntText
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  units
                </AntText>
              </div>
            ) : (
              <AntText type="secondary">-</AntText>
            );
          }}
        />
        <Table.Column
          title="Status"
          key="status"
          width={120}
          render={(_, record: BaseRecord) => (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {record.active ? (
                <StatusTag type="active">Active</StatusTag>
              ) : (
                <StatusTag type="inactive">Suspended</StatusTag>
              )}
              {record.featured && (
                <StatusTag type="featured">Featured</StatusTag>
              )}
            </div>
          )}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          key="actions"
          align="left"
          fixed="right"
          width={150}
          render={(_, record: BaseRecord) => {
            const isSuspended = !record.active;
            const moreActionsMenu = (
              <Menu
                style={{
                  backgroundColor: 'rgba(45, 45, 45, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  minWidth: '160px',
                }}
              >
                <Menu.Item
                  key="featured"
                  icon={record.featured ? <StarOutlined style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={() => {
                    setConfirmationModalState({ visible: true, record, action: 'toggleFeatured' });
                  }}
                  style={{ color: record.featured ? '#faad14' : 'rgba(255, 255, 255, 0.85)' }}
                  className="icon-text-separator"
                >
                  {record.featured ? 'Remove from Featured' : 'Make Product Featured'}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  key="delete"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setConfirmationModalState({ visible: true, record, action: 'delete' });
                  }}
                  style={{ color: 'rgba(255, 77, 79, 0.85)' }}
                  className="icon-text-separator"
                >
                  Delete Product
                </Menu.Item>
              </Menu>
            );
            return (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '4px',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleShowModal(record._id)}
                  style={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    border: 'none',
                    background: 'transparent',
                    padding: '4px',
                    minWidth: 'auto',
                    height: 'auto',
                  }}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setEditingProductId(record._id)}
                  style={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    border: 'none',
                    background: 'transparent',
                    padding: '4px',
                    minWidth: 'auto',
                    height: 'auto',
                  }}
                />
                <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                <Tooltip title={isSuspended ? 'Activate Product' : 'Suspend Product'}>
                  <Button
                    type="text"
                    size="small"
                    icon={isSuspended ? <CheckCircleOutlined /> : <StopOutlined />}
                    onClick={() => {
                      setConfirmationModalState({ visible: true, record, action: 'toggleActive' });
                    }}
                    style={{
                      color: isSuspended ? '#52c41a' : '#ff4d4f',
                      border: 'none',
                      background: 'transparent',
                      padding: '4px',
                      minWidth: 'auto',
                      height: 'auto',
                    }}
                  />
                </Tooltip>
                <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                <Dropdown overlay={moreActionsMenu} trigger={['click']} placement="bottomRight">
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    style={{
                      color: 'rgba(255, 255, 255, 0.65)',
                      border: 'none',
                      background: 'transparent',
                      padding: '4px',
                      minWidth: 'auto',
                      height: 'auto',
                    }}
                  />
                </Dropdown>
              </div>
            );
          }}
        />
      </Table>

      {showModalVisible && (
        <ProductShowModal
          productId={selectedProductId}
          visible={showModalVisible}
          onClose={handleCloseShowModal}
        />
      )}

      {confirmationModalState.record && confirmationModalState.action && (
        <ActionConfirmationModal
          visible={confirmationModalState.visible}
          onClose={() => setConfirmationModalState({ visible: false, record: null, action: null })}
          onConfirm={
            confirmationModalState.action === 'toggleActive'
              ? handleConfirmToggleActive
              : confirmationModalState.action === 'toggleFeatured'
              ? handleConfirmToggleFeatured
              : confirmationModalState.action === 'delete'
              ? handleConfirmDelete
              : () => {}
          }
          title={
            confirmationModalState.action === 'toggleActive'
              ? (!confirmationModalState.record.active ? 'Activate Product' : 'Suspend Product')
              : confirmationModalState.action === 'toggleFeatured'
              ? (!confirmationModalState.record.featured
                  ? 'Make Product Featured'
                  : 'Remove from Featured')
              : confirmationModalState.action === 'delete'
              ? 'Delete Product'
              : ''
          }
          subtitle={confirmationModalState.record.name}
          content={
            confirmationModalState.action === 'toggleActive'
              ? (!confirmationModalState.record.active
                  ? 'Are you sure you want to activate this product? It will become visible to customers and available for purchase.'
                  : 'Are you sure you want to suspend this product? It will be hidden from customers and unavailable for purchase.'
                )
              : confirmationModalState.action === 'toggleFeatured'
              ? (!confirmationModalState.record.featured
                  ? 'Are you sure you want to make this product featured? It will be highlighted in the store.'
                  : 'Are you sure you want to remove this product from featured?'
                )
              : confirmationModalState.action === 'delete'
              ? 'Are you sure you want to delete this product? This is a soft delete and can be undone from the trash.'
              : ''
          }
          okText={
            confirmationModalState.action === 'toggleActive'
              ? (!confirmationModalState.record.active ? 'Activate' : 'Suspend')
              : confirmationModalState.action === 'toggleFeatured'
              ? (!confirmationModalState.record.featured ? 'Make Featured' : 'Remove Featured')
              : confirmationModalState.action === 'delete'
              ? 'Delete'
              : ''
          }
          cancelText="Cancel"
          okType={
            confirmationModalState.action === 'delete' ? 'danger' : 'primary'
          }
          icon={
            confirmationModalState.action === 'toggleActive'
              ? (!confirmationModalState.record.active ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '22px' }} />
                ) : (
                  <StopOutlined style={{ color: '#ff4d4f', fontSize: '22px' }} />
                ))
              : confirmationModalState.action === 'toggleFeatured'
              ? (!confirmationModalState.record.featured ? (
                  <StarOutlined style={{ color: '#faad14', fontSize: '22px' }} />
                ) : (
                  <StarOutlined style={{ color: '#d9d9d9', fontSize: '22px' }} />
                ))
              : confirmationModalState.action === 'delete'
              ? <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '22px' }} />
              : null
          }
        />
      )}

      {editingProductId && (
        <EditProductModal
          recordId={editingProductId}
          onClose={() => setEditingProductId(null)}
          onSuccess={refreshTable}
        />
      )}
    </>
  );
};
