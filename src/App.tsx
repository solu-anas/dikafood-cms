import React, { useState, useEffect } from "react";
import { Refine, Authenticated, useApiUrl, useCustom, useNavigation } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider, Action, createAction, useRegisterActions } from "@refinedev/kbar";
import { useTokenRefresh } from "./hooks/useTokenRefresh";

import {
  ErrorComponent,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import "./styles/fonts.css";
import "./styles/global.css";

import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { ColorModeContext, ColorModeContextProvider } from "./contexts/color-mode";
import dataProvider from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";

// Import icons
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TruckOutlined,
  BankOutlined,
  FileTextOutlined,
  TeamOutlined,
  StarOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";

import {
  Button,
  theme,
  notification,
} from "antd";

import { getErrorMessage } from "./utils/error";
import feedback from "./utils/feedback";

// Products
import { ProductList } from "./pages/products";
import { ProductsTrash } from "./pages/products/trash";

// Orders
import { OrderList, OrderShow, OrderEdit } from "./pages/orders";

// Customers
import { CustomerList, CustomerOrders } from "./pages/customers";

// Delivery Methods
import { DeliveryMethodList, DeliveryMethodCreate, DeliveryMethodEdit, DeliveryMethodShow } from "./pages/delivery-methods";

// Bank Accounts
import { BankAccountList, BankAccountCreate, BankAccountEdit, BankAccountShow } from "./pages/bank-accounts";

// Leads
import { LeadList, LeadShow } from "./pages/leads";

// Reviews
import { ReviewList, ReviewShow } from "./pages/reviews";

// User Management (Root only)
import { UserList, UserShow, UserCreate, UserEdit } from "./pages/users";

// Custom Sidebar and Login
import { CustomSider } from "./components/sidebar";
import { Login } from "./pages/auth/login";

// Simple redirect component
const RedirectToLogin = () => {
  React.useEffect(() => {
    window.location.href = "/login";
  }, []);
  return null;
};

// Simple ErrorBoundary implementation
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can log error to an error reporting service here
    // console.error(error, errorInfo);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, textAlign: "center" }}>
          <h1>Something went wrong.</h1>
          <pre style={{ color: "#e74c3c", margin: 24 }}>
            {String(this.state.error)}
            {this.state.error?.stack ? "\n" + this.state.error.stack : ""}
          </pre>
          <button onClick={this.handleReset} style={{ padding: "8px 24px", fontSize: 16, cursor: "pointer" }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Inner component to use hooks for authenticated users only
const AuthenticatedWrapper = ({ children }: { children: React.ReactNode }) => {
  useTokenRefresh(); // Enable automatic token refresh for authenticated users
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <style>{`
          :root {
            --background: #1f1f1f;
            --foreground: #f8f8f8;
            --faint: #2a2a2a;
            --subtle: #4a4a4a;
            --primary: #AACC00;
            --highlight: #252525;
          }
          #kbar-portal > div {
            background-color: rgba(15, 15, 15, 0.8);
            backdrop-filter: blur(8px);
          }
          #kbar-portal input {
            background: var(--highlight);
            color: var(--foreground);
            border: 1px solid var(--subtle);
          }
          #kbar-portal > div > div > div > div:first-of-type {
            background: var(--background);
            border: 1px solid var(--subtle);
            border-radius: 12px;
            box-shadow: 0 16px 48px -8px rgba(0,0,0,0.5);
          }
          .kbar-result > div {
            color: #a0a0a0;
          }
          .kbar-result > div > div:first-of-type {
            color: var(--foreground);
          }
          .kbar-result[aria-selected="true"] > div {
            background: var(--highlight);
            color: var(--primary);
          }
          .kbar-result[aria-selected="true"] > div > div:first-of-type {
            color: var(--primary);
          }
        `}</style>
        <RefineKbarProvider>
          <ColorModeContextProvider>
            <AntdApp>
              <Refine
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                dataProvider={dataProvider}
                authProvider={authProvider}

                resources={[
                  // Core Ecommerce
                  {
                    name: "products",
                    list: "/products",
                    create: "/products/create",
                    edit: "/products/edit/:id",
                    show: "/products/show/:id",
                    meta: {
                      label: "Products",
                      icon: <ShoppingOutlined />,
                      canDelete: true,
                    },
                  },
                  {
                    name: "orders",
                    list: "/orders",
                    edit: "/orders/edit/:id",
                    show: "/orders/show/:id",
                    meta: {
                      label: "Orders",
                      icon: <ShoppingCartOutlined />,
                    },
                  },
                  {
                    name: "customers",
                    list: "/customers",
                    meta: {
                      label: "Customers",
                      icon: <UserOutlined />,
                    },
                  },
                  
                  // Logistics & Payments
                  {
                    name: "delivery-methods",
                    list: "/delivery-methods",
                    create: "/delivery-methods/create",
                    edit: "/delivery-methods/edit/:id",
                    show: "/delivery-methods/show/:id",
                    meta: {
                      label: "Delivery Methods",
                      icon: <TruckOutlined />,
                      canDelete: true,
                    },
                  },
                  {
                    name: "bank-accounts",
                    list: "/bank-accounts",
                    create: "/bank-accounts/create",
                    edit: "/bank-accounts/edit/:id",
                    show: "/bank-accounts/show/:id",
                    meta: {
                      label: "Bank Accounts",
                      icon: <BankOutlined />,
                      canDelete: true,
                    },
                  },
                  
                  // Lead Management
                  {
                    name: "leads",
                    list: "/leads",
                    show: "/leads/show/:id",
                    meta: {
                      label: "Leads",
                      icon: <FileTextOutlined />,
                    },
                  },
                  
                  // Reviews Management
                  {
                    name: "reviews",
                    list: "/reviews",
                    show: "/reviews/show/:id",
                    meta: {
                      label: "Reviews",
                      icon: <StarOutlined />,
                    },
                  },
                  
                  // User Management (Root only)
                  {
                    name: "users",
                    list: "/users",
                    create: "/users/create",
                    edit: "/users/edit/:id",
                    show: "/users/show/:id",
                    meta: {
                      label: "User Management",
                      icon: <TeamOutlined />,
                      canDelete: false,
                      hide: true, // Will be shown conditionally based on permissions
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  disableTelemetry: true,
                }}
              >
                <Routes>
                  {/* Login Route - outside authenticated routes */}
                  <Route 
                    path="/login" 
                    element={<Login />} 
                  />
                  
                  {/* Authenticated Routes */}
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<RedirectToLogin />}
                      >
                        <AuthenticatedWrapper>
                          <ThemedLayoutV2 Sider={() => <CustomSider />} Header={() => null}>
                            <Outlet />
                          </ThemedLayoutV2>
                        </AuthenticatedWrapper>
                      </Authenticated>
                    }
                  >
                    <Route index element={<ProductList />} />
                    
                    {/* Products */}
                    <Route path="/products">
                      <Route index element={<ProductList />} />
                      <Route path="trash" element={<ProductsTrash />} />
                    </Route>
                    
                    {/* Orders */}
                    <Route path="/orders">
                      <Route index element={<OrderList />} />
                      <Route path="edit/:id" element={<OrderEdit />} />
                      <Route path="show/:id" element={<OrderShow />} />
                    </Route>
                    
                    {/* Customers */}
                    <Route path="/customers">
                      <Route index element={<CustomerList />} />
                      <Route path="orders/:id" element={<CustomerOrders />} />
                    </Route>
                    
                    {/* Delivery Methods */}
                    <Route path="/delivery-methods">
                      <Route index element={<DeliveryMethodList />} />
                      <Route path="create" element={<DeliveryMethodCreate />} />
                      <Route path="edit/:id" element={<DeliveryMethodEdit />} />
                      <Route path="show/:id" element={<DeliveryMethodShow />} />
                    </Route>
                    
                    {/* Bank Accounts */}
                    <Route path="/bank-accounts">
                      <Route index element={<BankAccountList />} />
                      <Route path="create" element={<BankAccountCreate />} />
                      <Route path="edit/:id" element={<BankAccountEdit />} />
                      <Route path="show/:id" element={<BankAccountShow />} />
                    </Route>
                    
                    {/* Leads */}
                    <Route path="/leads">
                      <Route index element={<LeadList />} />
                      <Route path="show/:id" element={<LeadShow />} />
                    </Route>
                    
                    {/* Reviews */}
                    <Route path="/reviews">
                      <Route index element={<ReviewList />} />
                      <Route path="show/:id" element={<ReviewShow />} />
                    </Route>

                    {/* User Management */}
                    <Route path="/users">
                      <Route index element={<UserList />} />
                      <Route path="create" element={<UserCreate />} />
                      <Route path="edit/:id" element={<UserEdit />} />
                      <Route path="show/:id" element={<UserShow />} />
                    </Route>
                  </Route>
                </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
            </AntdApp>
          </ColorModeContextProvider>
        </RefineKbarProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
