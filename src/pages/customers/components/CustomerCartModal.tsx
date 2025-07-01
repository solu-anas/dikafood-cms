import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Table, 
  Spin, 
  Typography,
  Button,
  Space
} from "antd";
import { Link } from "@refinedev/core";
import { 
  ShoppingCartOutlined,
  ReloadOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { formatMAD, getCustomerCart } from "../../../providers/dataProvider";

const { Text } = Typography;

interface CustomerCartModalProps {
  visible: boolean;
  onClose: () => void;
  customerId: string | null;
  customerInfo?: {
    fullName: string;
    email: string;
  };
}

export const CustomerCartModal: React.FC<CustomerCartModalProps> = ({
  visible,
  onClose,
  customerId,
  customerInfo,
}) => {
  const [cartData, setCartData] = useState<any>(null);
  const [cartLoading, setCartLoading] = useState(false);

  const loadCustomerCart = async () => {
    if (!customerId) return;
    setCartLoading(true);
    try {
      const result = await getCustomerCart(customerId);
      if (result.success) {
        setCartData(result.data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (visible && customerId) {
      loadCustomerCart();
    }
  }, [visible, customerId]);

  const cartColumns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (name: string, item: any) => (
        <Link to={`/products?highlight=${item.productId}`} onClick={onClose}>
          <div>
            <Text strong>{item.brand ? `${item.brand} ${item.size}` : "Unknown Product"}</Text>
          </div>
        </Link>
      ),
    },
    {
      title: "Price",
      dataIndex: "unitPrice",
      key: "price",
      render: (price: number) => <Text>{formatMAD(price || 0)}</Text>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Total",
      key: "total",
      render: (_: any, item: any) => (
        <Text strong style={{ color: "#1890ff" }}>
          {formatMAD((item.unitPrice || 0) * (item.quantity || 0))}
        </Text>
      ),
    },
  ];
  
  const handleClose = () => {
    setCartData(null);
    onClose();
  };

  return (
    <Modal
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
          <ShoppingCartOutlined />
          <span>{customerInfo?.fullName}'s Cart</span>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={loadCustomerCart}
            loading={cartLoading}
          />
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined style={{ color: 'rgba(255, 255, 255, 0.65)' }} />}
    >
      {cartLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}><Spin /></div>
      ) : cartData && cartData.items && cartData.items.length > 0 ? (
        <>
          <Table
            dataSource={cartData.items}
            columns={cartColumns}
            rowKey={(item) => item._id}
            pagination={false}
            size="small"
          />
          <div style={{ marginTop: "16px", textAlign: "right" }}>
            <Text strong style={{ fontSize: "16px" }}>
              Total: {formatMAD(cartData.totalValue || 0)}
            </Text>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Text type="secondary">No cart data available.</Text>
        </div>
      )}
    </Modal>
  );
}; 