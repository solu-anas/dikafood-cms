import { useContext } from 'react';
import { usePermissions as useRefinePermissions } from '@refinedev/core';

// Role hierarchy based on dikafood-api
export type UserRole = 'root' | 'owner' | 'manager' | 'customer';

// Permission actions
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'list' | 'show';

// Resources/entities
export type PermissionResource = 
  | 'users' 
  | 'customers' 
  | 'managers'
  | 'products' 
  | 'orders' 
  | 'categories'
  | 'reviews' 
  | 'files' 
  | 'leads' 
  | 'blog-posts'
  | 'bank-accounts'
  | 'delivery-methods'
  | 'configs'
  | 'analytics'
  | 'dashboard'
  | 'settings'
  | 'roles';

// Permission matrix based on dikafood-api structure
const PERMISSION_MATRIX: Record<UserRole, Record<PermissionResource, PermissionAction[]>> = {
  root: {
    // Root has full access to everything
    users: ['create', 'read', 'update', 'delete', 'list', 'show'],
    customers: ['create', 'read', 'update', 'delete', 'list', 'show'],
    managers: ['create', 'read', 'update', 'delete', 'list', 'show'],
    products: ['create', 'read', 'update', 'delete', 'list', 'show'],
    orders: ['create', 'read', 'update', 'delete', 'list', 'show'],
    categories: ['create', 'read', 'update', 'delete', 'list', 'show'],
    reviews: ['create', 'read', 'update', 'delete', 'list', 'show'],
    files: ['create', 'read', 'update', 'delete', 'list', 'show'],
    leads: ['create', 'read', 'update', 'delete', 'list', 'show'],
    'blog-posts': ['create', 'read', 'update', 'delete', 'list', 'show'],
    'bank-accounts': ['create', 'read', 'update', 'delete', 'list', 'show'],
    'delivery-methods': ['create', 'read', 'update', 'delete', 'list', 'show'],
    configs: ['create', 'read', 'update', 'delete', 'list', 'show'],
    analytics: ['read', 'list', 'show'],
    'dashboard': ['read'],
    'settings': ['read', 'update'],
    'roles': ['create', 'read', 'update', 'delete', 'list', 'show'],
  },
  owner: {
    // Owner has nearly full access but cannot manage root users
    users: ['read', 'list', 'show'], // Limited user management
    customers: ['create', 'read', 'update', 'delete', 'list', 'show'],
    managers: ['create', 'read', 'update', 'delete', 'list', 'show'],
    products: ['create', 'read', 'update', 'delete', 'list', 'show'],
    orders: ['create', 'read', 'update', 'delete', 'list', 'show'],
    categories: ['create', 'read', 'update', 'delete', 'list', 'show'],
    reviews: ['create', 'read', 'update', 'delete', 'list', 'show'],
    files: ['create', 'read', 'update', 'delete', 'list', 'show'],
    leads: ['create', 'read', 'update', 'delete', 'list', 'show'],
    'blog-posts': ['create', 'read', 'update', 'delete', 'list', 'show'],
    'bank-accounts': ['create', 'read', 'update', 'delete', 'list', 'show'],
    'delivery-methods': ['create', 'read', 'update', 'delete', 'list', 'show'],
    configs: ['create', 'read', 'update', 'delete', 'list', 'show'],
    analytics: ['read', 'list', 'show'],
    'dashboard': ['read'],
    'settings': ['read', 'update'],
    'roles': ['create', 'read', 'update', 'delete', 'list', 'show'],
  },
  manager: {
    // Manager has operational access but limited user management
    users: ['read', 'list', 'show'],
    customers: ['create', 'read', 'update', 'list', 'show'], // Can't delete customers
    managers: ['read', 'list', 'show'], // Can't manage other managers
    products: ['create', 'read', 'update', 'delete', 'list', 'show'],
    orders: ['read', 'update', 'list', 'show'], // Can update but not create/delete
    categories: ['create', 'read', 'update', 'delete', 'list', 'show'],
    reviews: ['read', 'update', 'list', 'show'], // Can moderate but not create/delete
    files: ['create', 'read', 'update', 'delete', 'list', 'show'],
    leads: ['read', 'update', 'list', 'show'], // Can respond but not delete
    'blog-posts': ['create', 'read', 'update', 'delete', 'list', 'show'],
    'bank-accounts': ['read', 'list', 'show'], // Read-only access
    'delivery-methods': ['read', 'list', 'show'], // Read-only access
    configs: ['read', 'list', 'show'], // Read-only access
    analytics: ['read', 'list', 'show'],
    'dashboard': ['read'],
    'settings': ['read', 'update'],
    'roles': ['create', 'read', 'update', 'delete', 'list', 'show'],
  },
  customer: {
    // Customer has very limited access (mostly for profile and orders)
    users: [],
    customers: ['read', 'update', 'show'], // Own profile only
    managers: [],
    products: ['read', 'list', 'show'],
    orders: ['create', 'read', 'list', 'show'], // Own orders only
    categories: ['read', 'list', 'show'],
    reviews: ['create', 'read', 'update', 'list', 'show'], // Own reviews only
    files: [],
    leads: ['create'], // Can submit leads
    'blog-posts': ['read', 'list', 'show'],
    'bank-accounts': [],
    'delivery-methods': ['read', 'list', 'show'],
    configs: [],
    analytics: [],
    'dashboard': ['read'],
    'settings': ['read', 'update'],
    'roles': ['create', 'read', 'update', 'delete', 'list', 'show'],
  },
};

export interface Permission {
  role: UserRole | null;
  canAccess: (resource: PermissionResource, action: PermissionAction) => boolean;
  canAccessResource: (resource: PermissionResource) => boolean;
  isRoot: boolean;
  isOwner: boolean;
  isManager: boolean;
  isCustomer: boolean;
  getAccessibleActions: (resource: PermissionResource) => PermissionAction[];
}

export const usePermissions = (): Permission => {
  const { data: permissions } = useRefinePermissions<{ role?: UserRole }>();
  
  const role: UserRole | null = permissions?.role || null;
  
  const canAccess = (resource: PermissionResource, action: PermissionAction): boolean => {
    if (!role) return false;
    
    const resourcePermissions = PERMISSION_MATRIX[role]?.[resource] || [];
    return resourcePermissions.includes(action);
  };
  
  const canAccessResource = (resource: PermissionResource): boolean => {
    if (!role) return false;
    
    const resourcePermissions = PERMISSION_MATRIX[role]?.[resource] || [];
    return resourcePermissions.length > 0;
  };
  
  const getAccessibleActions = (resource: PermissionResource): PermissionAction[] => {
    if (!role) return [];
    
    return PERMISSION_MATRIX[role]?.[resource] || [];
  };
  
  return {
    role,
    canAccess,
    canAccessResource,
    isRoot: role === 'root',
    isOwner: role === 'owner',
    isManager: role === 'manager',
    isCustomer: role === 'customer',
    getAccessibleActions,
  };
};

// Navigation helper - determines which routes user can access
export const getAccessibleRoutes = (role: UserRole | null): string[] => {
  if (!role) return [];
  
  const routes: string[] = [];
  
  // Check each resource for list access
  Object.entries(PERMISSION_MATRIX[role] || {}).forEach(([resource, actions]) => {
    if (actions.includes('list')) {
      routes.push(resource);
    }
  });
  
  return routes;
};

// Resource helper - gets available actions for current user on a resource
export const getResourceActions = (role: UserRole | null, resource: PermissionResource): PermissionAction[] => {
  if (!role) return [];
  
  return PERMISSION_MATRIX[role]?.[resource] || [];
}; 