import React, { useState } from "react";
import { useTable, ShowButton, EditButton, DeleteButton } from "@refinedev/antd";
import { useCustomMutation } from "@refinedev/core";
import {
  Table,
  Space,
  Button,
  Typography,
  Avatar,
  Tooltip,
  Modal,
  Image,
  message,
  Alert,
  Spin,
} from "antd";
import { 
  BankOutlined, 
  QrcodeOutlined, 
  ReloadOutlined, 
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined 
} from "@ant-design/icons";
import { usePermissions } from "../../hooks/usePermissions";
import { useNavigation } from "../../hooks/useNavigation";
import { UniversalPage, StatusTag } from "../../components";
import type { StatusFilter, ActionButton } from "../../components";
import { getErrorMessage } from "../../utils/error";
import feedback from "../../utils/feedback";

const { Text } = Typography;

// QR Code Modal Component
const QRCodeModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  bankAccount: any;
}> = ({ visible, onClose, bankAccount }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { mutate: generateQRCode } = useCustomMutation();

  const handleGenerateQRCode = async () => {
    const accountId = bankAccount?.bankAccountId || bankAccount?._id;
    if (!accountId) return;
    
    setLoading(true);
    try {
      await generateQRCode({
        url: `/management/bank-accounts/qrcode/generate`,
        method: "post",
        values: { bankAccountId: accountId },
        successNotification: {
          message: "QR Code generated successfully",
          type: "success",
        },
      }, {
        onSuccess: () => {
          const qrUrl = `http://localhost:1025/management/bank-accounts/qrcode?bankAccountId=${accountId}&option=url`;
          setQrCodeUrl(qrUrl);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      setLoading(false);
      message.error("Failed to generate QR code");
    }
  };

  React.useEffect(() => {
    if (visible && bankAccount?.qrCodeId) {
      const accountId = bankAccount?.bankAccountId || bankAccount?._id;
      const qrUrl = `http://localhost:1025/management/bank-accounts/qrcode?bankAccountId=${accountId}&option=url`;
      setQrCodeUrl(qrUrl);
    }
  }, [visible, bankAccount]);

  return (
    <Modal
      title={`QR Code - ${bankAccount?.bank || bankAccount?.bankName || bankAccount?.data?.bankName || 'Bank Account'}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button 
          key="generate" 
          type="primary" 
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={handleGenerateQRCode}
        >
          {bankAccount?.qrCodeId ? 'Regenerate QR Code' : 'Generate QR Code'}
        </Button>,
      ]}
      width={600}
    >
      <div style={{ textAlign: 'center', padding: '20px' }}>
        {qrCodeUrl ? (
          <div>
            <Image
              src={`http://localhost:1025/management/bank-accounts/qrcode?bankAccountId=${bankAccount?.bankAccountId || bankAccount?._id}`}
              alt="Bank Account QR Code"
              style={{ maxWidth: '300px', maxHeight: '300px' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUgEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary" style={{ color: 'var(--text-secondary)' }}>
                This QR code contains the bank account details for easy sharing
              </Text>
            </div>
          </div>
        ) : (
          <div>
            <QrcodeOutlined style={{ fontSize: '64px', color: '#ccc' }} />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary" style={{ color: 'var(--text-secondary)' }}>
                {bankAccount?.qrCodeId 
                  ? 'Loading QR code...' 
                  : 'No QR code generated yet. Click "Generate QR Code" to create one.'
                }
              </Text>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const BankAccountList: React.FC = () => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const permissions = usePermissions();
  const navigation = useNavigation();
  const { tableProps, tableQueryResult } = useTable({
    resource: "bank-accounts",
    syncWithLocation: true,
  });
  const { isLoading, isError, error } = tableQueryResult;

  const handleShowQRCode = (record: any) => {
    setSelectedBankAccount(record);
    setQrModalVisible(true);
  };

  // Filter data based on active filter
  const getFilteredData = () => {
    if (!tableProps.dataSource) return [];
    
    switch (activeFilter) {
      case 'active':
        return tableProps.dataSource.filter((item: any) => !item.isSuspended);
      case 'suspended':
        return tableProps.dataSource.filter((item: any) => item.isSuspended);
      case 'with-qr':
        return tableProps.dataSource.filter((item: any) => item.qrCodeId);
      case 'without-qr':
        return tableProps.dataSource.filter((item: any) => !item.qrCodeId);
      default:
        return tableProps.dataSource;
    }
  };

  const filteredData = getFilteredData();
  const totalAccounts = tableProps.dataSource?.length || 0;
  const activeAccounts = tableProps.dataSource?.filter((item: any) => !item.isSuspended).length || 0;
  const suspendedAccounts = tableProps.dataSource?.filter((item: any) => item.isSuspended).length || 0;
  const withQR = tableProps.dataSource?.filter((item: any) => item.qrCodeId).length || 0;

  const statusFilters: StatusFilter[] = [
    {
      key: 'all',
      label: 'All Accounts',
      icon: <BankOutlined />,
      color: '#1890ff',
      bgColor: 'rgba(24, 144, 255, 0.15)',
      borderColor: 'rgba(24, 144, 255, 0.3)',
      count: totalAccounts
    },
    {
      key: 'active',
      label: 'Active',
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      bgColor: 'rgba(82, 196, 26, 0.15)',
      borderColor: 'rgba(82, 196, 26, 0.3)',
      count: activeAccounts
    },
    {
      key: 'suspended',
      label: 'Suspended',
      icon: <ExclamationCircleOutlined />,
      color: '#ff4d4f',
      bgColor: 'rgba(255, 77, 79, 0.15)',
      borderColor: 'rgba(255, 77, 79, 0.3)',
      count: suspendedAccounts
    },
    {
      key: 'with-qr',
      label: 'With QR',
      icon: <QrcodeOutlined />,
      color: '#fa8c16',
      bgColor: 'rgba(250, 140, 22, 0.15)',
      borderColor: 'rgba(250, 140, 22, 0.3)',
      count: withQR
    }
  ];

  const actionButtons: ActionButton[] = [
    {
      key: 'create',
      label: 'Create Account',
      icon: <PlusOutlined />,
      onClick: () => navigation.create('bank-accounts'),
      type: 'primary'
    }
  ];

  if (isLoading) return <Spin />;
  if (isError) return <Alert {...feedback.alertProps("error", "Error", error)} />;

  return (
    <>
      <UniversalPage
        title="Bank Accounts"
        statusFilters={statusFilters}
        activeStatusFilter={activeFilter}
        onStatusFilterChange={setActiveFilter}
        customActions={actionButtons}
        showCreateButton={false}
        tableProps={{
          ...tableProps,
          dataSource: filteredData,
          rowKey: (record: any, index?: number) => record.bankAccountId || record._id || record.id || `bank-account-${index}`,
          scroll: { x: 1200 }
        }}
        tableClassName="bank-accounts-table"
        entityName="bank accounts"
      >
        <Table.Column
          title="Bank"
          dataIndex="bank"
          key="bank"
          width={280}
          render={(value: string, record: any) => (
            <Space>
              <Avatar
                size={40}
                icon={<BankOutlined />}
                style={{ backgroundColor: '#fa8c16' }}
              />
              <div>
                <Text strong style={{ color: 'var(--text-primary)' }}>
                  {record.bank || value}
                </Text>
                <div>
                  <Text type="secondary" style={{ fontSize: "12px", color: 'var(--text-secondary)' }}>
                    {record.details?.branch || 'No branch specified'}
                  </Text>
                </div>
              </div>
            </Space>
          )}
        />

        <Table.Column
          title="Account Details"
          dataIndex={["details", "accountNumber"]}
          key="accountNumber"
          width={200}
          render={(value: string, record: any) => (
            <div>
              <Text code style={{ color: 'var(--text-primary)' }}>
                {record.details?.accountNumber || value}
              </Text>
              <div>
                <Text style={{ fontSize: "12px", color: 'var(--text-secondary)' }}>
                  {record.owner || 'No holder specified'}
                </Text>
              </div>
            </div>
          )}
        />

        <Table.Column
          title="Status"
          dataIndex="isSuspended"
          key="status"
          width={120}
          render={(isSuspended: boolean) => (
            <StatusTag type={isSuspended ? "suspended" : "active"}>
              {isSuspended ? "SUSPENDED" : "ACTIVE"}
            </StatusTag>
          )}
        />

        <Table.Column
          title="QR Code"
          dataIndex="qrCodeId"
          key="qrCodeId"
          width={140}
          render={(qrCodeId: string, record: any) => (
            <div>
              {qrCodeId ? (
                <StatusTag type="available">
                  AVAILABLE
                </StatusTag>
              ) : (
                <StatusTag type="unavailable">
                  NOT GENERATED
                </StatusTag>
              )}
            </div>
          )}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          key="actions"
          width={160}
          fixed="right"
          render={(_: any, record: any) => {
            const actions = [];
            
            if (permissions.canAccess('bank-accounts', 'show')) {
              actions.push(
                <ShowButton key="show" hideText size="small" recordItemId={record.bankAccountId || record._id} />
              );
            }
            
            if (permissions.canAccess('bank-accounts', 'show') && permissions.canAccess('bank-accounts', 'update') && actions.length > 0) {
              actions.push(
                <div key="separator1" style={{ 
                  width: '1px', 
                  height: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                }} />
              );
            }
            
            if (permissions.canAccess('bank-accounts', 'update')) {
              actions.push(
                <EditButton key="edit" hideText size="small" recordItemId={record.bankAccountId || record._id} />
              );
            }
            
            if (actions.length > 0) {
              actions.push(
                <div key="separator2" style={{ 
                  width: '1px', 
                  height: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                }} />
              );
            }
            
            actions.push(
              <Tooltip key="qr" title="View QR Code">
                <Button
                  type="text"
                  size="small"
                  icon={<QrcodeOutlined />}
                  onClick={() => handleShowQRCode(record)}
                />
              </Tooltip>
            );
            
            if (permissions.canAccess('bank-accounts', 'delete')) {
              actions.push(
                <div key="separator3" style={{ 
                  width: '1px', 
                  height: '16px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                }} />
              );
              actions.push(
                <DeleteButton key="delete" hideText size="small" recordItemId={record.bankAccountId || record._id} />
              );
            }
            
            return (
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start',
                gap: '4px',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {actions}
              </div>
            );
          }}
        />
      </UniversalPage>

      <QRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        bankAccount={selectedBankAccount}
      />
    </>
  );
}; 