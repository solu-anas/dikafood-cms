import React, { useContext } from "react";
import { useGetIdentity, useLogout, useNavigation, useMenu, usePermissions, useInvalidate } from "@refinedev/core";
import {
  FileTextOutlined,
  TeamOutlined,
  ShoppingOutlined,
  BankOutlined,
  TruckOutlined,
  ReloadOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useThemedLayoutContext } from "@refinedev/antd";
import {
  Layout as AntdLayout,
  Menu,
  Avatar,
  Space,
  Typography,
  Divider,
  Button,
  Dropdown,
  theme,
  Tag,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number | string;
  name: string;
  avatar: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
};

interface CustomSiderProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  fixed?: boolean;
}

interface UserPermissions {
  role?: string;
}

const HamburgerMenu: React.FC = () => {
  const { siderCollapsed, setSiderCollapsed } = useThemedLayoutContext();
  const { token } = useToken();

  return (
    <Button
      type="text"
      icon={<MenuOutlined style={{ color: token.colorText }} />}
      onClick={() => setSiderCollapsed(!siderCollapsed)}
      style={{
        border: "none",
        marginRight: "16px",
      }}
    />
  );
};

export const CustomSider: React.FC<CustomSiderProps> = ({
  collapsed,
  onCollapse,
  fixed = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { data: permissions } = usePermissions<UserPermissions>();
  const { mutate: logout } = useLogout();
  const { siderCollapsed, setSiderCollapsed } = useThemedLayoutContext();
  const { push } = useNavigation();
  const { menuItems, selectedKey } = useMenu();
  const invalidate = useInvalidate();

  const isCollapsed = collapsed ?? siderCollapsed;
  const isRoot = permissions?.role === "root";
  const isOwner = permissions?.role === "owner";

  const handleCollapse = (value: boolean) => {
    if (onCollapse) {
      onCollapse(value);
    } else {
      setSiderCollapsed(value);
    }
  };

  const handleRefresh = (resourceName: string) => {
    invalidate({
      resource: resourceName,
      invalidates: ["list", "detail"],
    });
  };

  const profileMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile Settings' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Preferences' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Sign Out', onClick: () => logout(), danger: true },
  ];

  const getRoleIcon = (role?: string) => {
    if (role === "root") return <CrownOutlined style={{ color: "#ff4d4f" }} />;
    if (role === "owner") return <CrownOutlined style={{ color: "#ff7a00" }} />;
    if (role === "manager") return <TeamOutlined style={{ color: "#1890ff" }} />;
    return <UserOutlined style={{ color: "#52c41a" }} />;
  };

  const getRoleColor = (role?: string) => {
    if (role === "root") return "red";
    if (role === "owner") return "orange";
    if (role === "manager") return "blue";
    return "green";
  };

  const getRoleLabel = (role?: string) => {
    if (role === "root") return "Root Admin";
    if (role === "owner") return "Business Owner";
    if (role === "manager") return "Manager";
    return "User";
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.key === "/users" && !isRoot && !isOwner) return false;
    return true;
  });

  const getResourceFromRoute = (route: string): string => {
    const routeMap: { [key: string]: string } = {
      '/products': 'products', '/categories': 'categories', '/orders': 'orders',
      '/customers': 'customers', '/users': 'users', '/reviews': 'reviews',
      '/leads': 'leads', '/bank-accounts': 'bank-accounts', '/delivery-methods': 'delivery-methods',
    };
    return routeMap[route] || route.replace('/', '');
  };

  const convertMenuItems = (items: any[]): any[] => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          key: item.key,
          icon: <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.75)' }}>{item.icon}</span>,
          label: <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: 400, fontFamily: 'var(--font-body)' }}>{item.label}</span>,
          children: convertMenuItems(item.children),
        };
      }
      const hasRefresh = ['/products', '/categories', '/orders', '/customers', '/users', '/reviews', '/leads', '/bank-accounts', '/delivery-methods'].includes(item.key);
      return {
        key: item.key,
        icon: <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.75)' }}>{item.icon}</span>,
        label: (
          <div className="nav-item-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: 400, fontFamily: 'var(--font-body)' }}>{item.label}</span>
            {hasRefresh && !isCollapsed && (
              <Tooltip title="Refresh" placement="right">
                <Button
                  type="text" size="small" icon={<ReloadOutlined />} className="nav-refresh-btn"
                  onClick={(e) => { e.stopPropagation(); handleRefresh(getResourceFromRoute(item.key)); }}
                  style={{ color: 'rgba(255, 255, 255, 0.5)', border: 'none', padding: '2px 4px', height: '20px', width: '20px', minWidth: '20px', marginLeft: '8px', opacity: 0, transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'; e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                />
              </Tooltip>
            )}
          </div>
        ),
        onClick: () => { if (item.route) { push(item.route); } },
      };
    });
  };

  const organizeMenuItems = (items: any[]): any[] => {
    const groups = [
      { title: 'E-commerce', items: ['products', 'orders', 'customers', 'leads', 'reviews'] },
      { title: 'Operations', items: ['delivery-methods', 'bank-accounts'] },
    ];
    const organizedItems: any[] = [];
    groups.forEach((group, groupIndex) => {
      if (groupIndex > 0) organizedItems.push({ type: 'divider', key: `divider-${groupIndex}`, style: { borderColor: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' } });
      group.items.forEach(itemKey => {
        const menuItem = items.find(item => item.key.includes(itemKey) || item.key.endsWith(itemKey));
        if (menuItem) organizedItems.push(menuItem);
      });
    });
    return organizedItems;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    const findMenuItem = (items: any[], targetKey: string): any => {
      for (const item of items) {
        if (item.key === targetKey) return item;
        if (item.children) {
          const found = findMenuItem(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };
    const menuItem = findMenuItem(filteredMenuItems, key);
    if (menuItem?.route) push(menuItem.route);
  };

  return (
    <AntdLayout.Sider
      collapsible
      collapsed={isCollapsed}
      onCollapse={handleCollapse}
      collapsedWidth={80}
      width={220}
      breakpoint="lg"
      trigger={null}
      style={{
        height: '100vh',
        maxHeight: '100vh',
        left: 0,
        top: 0,
        bottom: 0,
        background: "#1f1f1f",
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
      }}
    >
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div>
          <div
            style={{
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isCollapsed ? '0' : '0 20px',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgElevated,
              cursor: 'pointer',
            }}
            onClick={() => push('/')}
          >
            {isCollapsed ? (
              <img src="/favicon.svg" alt="DikaFood" style={{ width: '32px', height: '32px' }} />
            ) : (
              <img src="/logo.svg" alt="DikaFood CMS" style={{ height: '40px', width: 'auto', maxWidth: '200px' }} />
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
            <Menu
              selectedKeys={selectedKey ? [selectedKey] : []}
              mode="inline"
              items={organizeMenuItems(convertMenuItems(filteredMenuItems))}
              onClick={handleMenuClick}
              inlineIndent={isCollapsed ? 0 : 12}
              theme="dark"
              className="custom-menu"
              style={{ background: 'transparent', border: 'none' }}
            />
            <style>
              {`
                .custom-menu .ant-menu-item,
                .custom-menu .ant-menu-submenu-title {
                  height: 40px !important;
                  margin-block: 4px !important;
                  border-radius: 8px;
                }
                .custom-menu .ant-menu-item-selected {
                  background-color: rgba(255, 255, 255, 0.08) !important;
                }
                .custom-menu .ant-menu-item-icon + .ant-menu-title-content {
                  position: relative;
                  margin-left: 12px !important;
                }
                .custom-menu .nav-item-container {
                  position: relative;
                }
                .custom-menu .nav-item-container::before {
                  content: '';
                  position: absolute;
                  left: -6px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 1px;
                  height: 14px;
                  background-color: rgba(255, 255, 255, 0.1);
                }
              `}
            </style>
          </div>
        </div>
        
        <div style={{
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgElevated,
          padding: isCollapsed ? '12px 8px' : '12px 20px',
        }}>
          <Dropdown
            menu={{ items: profileMenuItems }}
            placement="topRight"
            trigger={['click']}
          >
            <Button type="text" style={{ width: '100%', height: 'auto', padding: isCollapsed ? '10px 0' : '10px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '10px', borderRadius: 6, background: 'rgba(170, 204, 0, 0.08)', border: `1px solid rgba(170, 204, 0, 0.15)` }}>
              {!isCollapsed && (
                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                    {user?.name || 'Admin User'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag color={getRoleColor(user?.role)} icon={getRoleIcon(user?.role)} style={{ fontSize: '10px', padding: '2px 6px', margin: 0, lineHeight: 1.2, color: 'rgba(255, 255, 255, 0.75)', backgroundColor: 'rgba(170, 204, 0, 0.2)', border: '1px solid rgba(170, 204, 0, 0.3)' }}>
                      {getRoleLabel(user?.role)}
                    </Tag>
                    {user?.isVerified ? <CheckCircleOutlined style={{ color: '#AACC00', fontSize: '12px' }} /> : <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '12px' }} />}
                  </div>
                </div>
              )}
            </Button>
          </Dropdown>
        </div>
      </div>
    </AntdLayout.Sider>
  );
}; 