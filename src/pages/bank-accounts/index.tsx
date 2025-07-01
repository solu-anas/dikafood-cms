import React, { useState } from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton,
  useForm,
  Create,
  Edit,
  Show,
} from "@refinedev/antd";
import { useShow, useCustomMutation } from "@refinedev/core";
import {
  Table,
  Space,
  Button,
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Tag,
  Card,
  Descriptions,
  Modal,
  Image,
  Tooltip,
  message,
} from "antd";
import { QrcodeOutlined, ReloadOutlined } from "@ant-design/icons";
import CountryFlag from "../../components/CountryFlag";

const { Title, Text } = Typography;
const { TextArea } = Input;

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
    if (!bankAccount?._id) return;
    
    setLoading(true);
    try {
      await generateQRCode({
        url: `/management/bank-accounts/qrcode/generate`,
        method: "post",
        values: {
          bankAccountId: bankAccount._id
        },
        successNotification: {
          message: "QR Code generated successfully",
          type: "success",
        },
      }, {
        onSuccess: (data) => {
          // After generating, fetch the QR code
          const qrUrl = `http://localhost:1025/management/bank-accounts/qrcode?bankAccountId=${bankAccount._id}&option=url`;
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

  const handleViewQRCode = () => {
    if (bankAccount?._id) {
      const qrUrl = `http://localhost:1025/management/bank-accounts/qrcode?bankAccountId=${bankAccount._id}&option=url`;
      setQrCodeUrl(qrUrl);
    }
  };

  React.useEffect(() => {
    if (visible && bankAccount?.qrCodeId) {
      handleViewQRCode();
    }
  }, [visible, bankAccount]);

  return (
    <Modal
      title={`QR Code - ${bankAccount?.bankName || bankAccount?.data?.bankName || 'Bank Account'}`}
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
              src={`http://localhost:1025/management/bank-accounts/qrcode?bankAccountId=${bankAccount._id}`}
              alt="Bank Account QR Code"
              style={{ maxWidth: '300px', maxHeight: '300px' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">
                This QR code contains the bank account details for easy sharing
              </Text>
            </div>
          </div>
        ) : (
          <div>
            <QrcodeOutlined style={{ fontSize: '64px', color: '#ccc' }} />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">
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

// Export the new UniversalPage version from list.tsx
export { BankAccountList } from "./list";

// Bank Account Create Component
export const BankAccountCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "bank-accounts",
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Create New Bank Account">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Bank Name"
              name="bankName"
              rules={[{ required: true, message: "Please enter bank name" }]}
            >
              <Input placeholder="Bank name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Account Number"
              name="accountNumber"
              rules={[{ required: true, message: "Please enter account number" }]}
            >
              <Input placeholder="Account number" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Account Holder"
              name="accountHolder"
              rules={[{ required: true, message: "Please enter account holder name" }]}
            >
              <Input placeholder="Account holder name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Branch"
              name="branch"
            >
              <Input placeholder="Branch name (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Country Code"
              name="countryCode"
              rules={[{ required: true, message: "Please enter country code" }]}
            >
              <Select placeholder="Select country">
                <Select.Option value="MA">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="MA" size="small" />
                    MA (Morocco)
                  </div>
                </Select.Option>
                <Select.Option value="FR">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="FR" size="small" />
                    FR (France)
                  </div>
                </Select.Option>
                <Select.Option value="ES">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="ES" size="small" />
                    ES (Spain)
                  </div>
                </Select.Option>
                <Select.Option value="US">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="US" size="small" />
                    US (United States)
                  </div>
                </Select.Option>
                <Select.Option value="GB">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="GB" size="small" />
                    GB (United Kingdom)
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="SWIFT Code"
              name="swiftCode"
            >
              <Input placeholder="SWIFT/BIC code (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Notes"
          name="notes"
        >
          <TextArea rows={3} placeholder="Additional notes (optional)" />
        </Form.Item>
      </Form>
    </Create>
  );
};

// Bank Account Edit Component
export const BankAccountEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "bank-accounts",
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Edit Bank Account">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Bank Name"
              name={["data", "bankName"]}
              rules={[{ required: true, message: "Please enter bank name" }]}
            >
              <Input placeholder="Bank name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Account Number"
              name={["data", "accountNumber"]}
              rules={[{ required: true, message: "Please enter account number" }]}
            >
              <Input placeholder="Account number" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Account Holder"
              name={["data", "accountHolder"]}
              rules={[{ required: true, message: "Please enter account holder name" }]}
            >
              <Input placeholder="Account holder name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Branch"
              name={["data", "branch"]}
            >
              <Input placeholder="Branch name (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Country Code"
              name={["data", "countryCode"]}
              rules={[{ required: true, message: "Please enter country code" }]}
            >
              <Select placeholder="Select country">
                <Select.Option value="MA">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="MA" size="small" />
                    MA (Morocco)
                  </div>
                </Select.Option>
                <Select.Option value="FR">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="FR" size="small" />
                    FR (France)
                  </div>
                </Select.Option>
                <Select.Option value="ES">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="ES" size="small" />
                    ES (Spain)
                  </div>
                </Select.Option>
                <Select.Option value="US">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="US" size="small" />
                    US (United States)
                  </div>
                </Select.Option>
                <Select.Option value="GB">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode="GB" size="small" />
                    GB (United Kingdom)
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="SWIFT Code"
              name={["data", "swiftCode"]}
            >
              <Input placeholder="SWIFT/BIC code (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Notes"
          name={["data", "notes"]}
        >
          <TextArea rows={3} placeholder="Additional notes (optional)" />
        </Form.Item>
      </Form>
    </Edit>
  );
};

// Bank Account Show Component
export const BankAccountShow: React.FC = () => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  
  const { queryResult } = useShow({
    resource: "bank-accounts",
  });
  
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <>
      <Show 
        isLoading={isLoading} 
        title="Bank Account Details"
        headerButtons={
          <Space>
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => setQrModalVisible(true)}
            >
              {record?.qrCodeId ? "View QR Code" : "Generate QR Code"}
            </Button>
          </Space>
        }
      >
        <Card>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Bank Name">
              {record?.data?.bankName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Account Number">
              <Text code>{record?.data?.accountNumber || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Account Holder">
              {record?.data?.accountHolder || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Branch">
              {record?.data?.branch || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Country Code">
              <CountryFlag 
                countryCode={record?.data?.countryCode || ""} 
                size="small" 
                showCode={true}
                className="flex items-center"
              />
            </Descriptions.Item>
            <Descriptions.Item label="SWIFT Code">
              <Text code>{record?.data?.swiftCode || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={record?.metadata?.isSuspended ? "red" : "green"}>
                {record?.metadata?.isSuspended ? "Suspended" : "Active"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Serial Number">
              {record?.metadata?.serialNumber || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="QR Code Status">
              <Tag color={record?.qrCodeId ? "green" : "orange"}>
                {record?.qrCodeId ? "Generated" : "Not Generated"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              {record?.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}
            </Descriptions.Item>
            {record?.data?.notes && (
              <Descriptions.Item label="Notes" span={2}>
                {record.data.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </Show>
      
      <QRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        bankAccount={record}
      />
    </>
  );
}; 