import React from 'react';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  StopOutlined,
  StarOutlined,
  UserOutlined,
  ShoppingOutlined,
  TruckOutlined,
  CreditCardOutlined,
  BookOutlined,
  MessageOutlined,
  BankOutlined,
  CarOutlined,
  RocketOutlined,
  CrownOutlined,
  ShopOutlined,
  QrcodeOutlined
} from '@ant-design/icons';

export type StatusTagType = 
  | 'active' 
  | 'inactive' 
  | 'suspended' 
  | 'featured' 
  | 'published' 
  | 'draft' 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'delivered' 
  | 'processing'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'
  | 'paid'
  | 'unpaid'
  | 'catalog'
  | 'contact'
  | 'verified'
  | 'unverified'
  | 'available'
  | 'unavailable'
  | 'free'
  | 'premium'
  | 'express'
  | 'pickup';

export interface StatusTagProps {
  type?: StatusTagType;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  style?: React.CSSProperties;
}

export const StatusTag: React.FC<StatusTagProps> = ({ 
  type = 'default', 
  children, 
  icon,
  size = 'default',
  style = {}
}) => {
  const getTagStyles = () => {
    const baseStyles = {
      fontWeight: 500,
      border: 'none',
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: size === 'small' ? '11px' : size === 'large' ? '14px' : '12px',
      padding: size === 'small' ? '1px 6px' : size === 'large' ? '4px 12px' : '2px 8px',
      borderRadius: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      lineHeight: size === 'small' ? '14px' : size === 'large' ? '20px' : '16px',
      fontFamily: 'var(--font-body)',
      ...style
    };

    const typeStyles: Record<StatusTagType, Partial<React.CSSProperties>> = {
      active: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      inactive: {
        backgroundColor: 'rgba(255, 77, 79, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      suspended: {
        backgroundColor: 'rgba(255, 77, 79, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      featured: {
        backgroundColor: 'rgba(250, 173, 20, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      published: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      draft: {
        backgroundColor: 'rgba(250, 173, 20, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      pending: {
        backgroundColor: 'rgba(250, 173, 20, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      confirmed: {
        backgroundColor: 'rgba(24, 144, 255, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      cancelled: {
        backgroundColor: 'rgba(255, 77, 79, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      delivered: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      processing: {
        backgroundColor: 'rgba(24, 144, 255, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      success: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      error: {
        backgroundColor: 'rgba(255, 77, 79, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      warning: {
        backgroundColor: 'rgba(250, 173, 20, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      info: {
        backgroundColor: 'rgba(24, 144, 255, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      default: {
        backgroundColor: 'rgba(140, 140, 140, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      paid: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      unpaid: {
        backgroundColor: 'rgba(250, 173, 20, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      catalog: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      contact: {
        backgroundColor: 'rgba(250, 173, 20, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      verified: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      unverified: {
        backgroundColor: 'rgba(250, 173, 20, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      available: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      unavailable: {
        backgroundColor: 'rgba(255, 77, 79, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      free: {
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      premium: {
        backgroundColor: 'rgba(114, 46, 209, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      express: {
        backgroundColor: 'rgba(250, 140, 22, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
      pickup: {
        backgroundColor: 'rgba(24, 144, 255, 0.3)',
        color: 'rgba(255, 255, 255, 0.85)',
      },
    };

    return {
      ...baseStyles,
      ...typeStyles[type]
    };
  };

  const getDefaultIcon = () => {
    if (icon) return icon;

    const iconMap: Record<StatusTagType, React.ReactNode> = {
      active: <CheckCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      inactive: <StopOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      suspended: <ExclamationCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      featured: <StarOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      published: <CheckCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      draft: <ClockCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      pending: <ClockCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      confirmed: <CheckCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      cancelled: <StopOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      delivered: <TruckOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      processing: <ClockCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      success: <CheckCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      error: <ExclamationCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      warning: <ExclamationCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      info: <ExclamationCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      default: null,
      paid: <CreditCardOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      unpaid: <CreditCardOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      catalog: <BookOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      contact: <MessageOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      verified: <CheckCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      unverified: <ExclamationCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      available: <QrcodeOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      unavailable: <ExclamationCircleOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      free: <CarOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      premium: <CrownOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      express: <RocketOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
      pickup: <ShopOutlined style={{ fontSize: size === 'small' ? '9px' : size === 'large' ? '12px' : '10px' }} />,
    };

    return iconMap[type];
  };

  return (
    <span style={getTagStyles()}>
      {getDefaultIcon()}
      {children}
    </span>
  );
};

export default StatusTag; 