import { DataProvider } from "@refinedev/core";
import api from "../utils/api";
import { stringify } from "query-string";
import { apiConfig } from "../config/api";
import { safeNotificationError } from "../utils/notify";
import { getErrorMessage } from "../utils/error";

// Helper function to format MAD currency
export const formatMAD = (value: number): string => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
  }).format(value);
};

// Helper function to map API resource names to endpoints
const getApiEndpoint = (resource: string): string => {
  const endpoints: Record<string, string> = {
    products: "/api/admin/products",
    brands: "/api/admin/brands",
    orders: "/api/admin/orders",
    customers: "/api/admin/customers",
    "delivery-methods": "/api/admin/delivery-methods",
    "bank-accounts": "/api/admin/bank-accounts",
    reviews: "/api/admin/reviews",
    blog: "/api/admin/blog",
    "blog-posts": "/api/admin/blog",
    leads: "/api/admin/leads",
    files: "/api/admin/files",
    "product-gallery": "/api/admin/product-gallery",
    "product-templates": "/api/admin/product-gallery",
    catalogs: "/api/admin/catalogs",
    sessions: "/api/admin/me/sessions",
    configs: "/api/admin/configs",
    carts: "/api/cart", // For cart management (public/customer)
    users: "/api/admin/users",
    managers: "/api/admin/managers", // Manager creation endpoint
  };
  
  return endpoints[resource] || `/api/admin/${resource}`;
};

// Helper function to transform data for specific resources
const transformData = (resource: string, item: any) => {
  if (resource === "orders") {
    // The orders API returns data in this structure:
    // { orderId, orderSerialNumber, contact: { fullName, email, phone }, products: { cost, productsCount, unitsCount }, 
    //   orderStatus, orderPhase, delivery: { methodTitle, cost }, payment: { paymentType, totalAmount }, createdAt, agent }
    return {
      // Use orderId as the primary identifier
      id: item.orderId,
      orderId: item.orderId,
      orderSerialNumber: item.orderSerialNumber || "N/A",
      
      // Customer contact information
      contact: {
        fullName: item.contact?.fullName || "N/A",
        email: item.contact?.email || "N/A",
        phone: item.contact?.phone || "N/A"
      },
      
      // Products information
      products: {
        cost: item.products?.cost || 0,
        productsCount: item.products?.productsCount || 0,
        unitsCount: item.products?.unitsCount || 0
      },
      
      // Order status information
      orderStatus: item.orderStatus || "draft",
      orderPhase: item.orderPhase || "unknown",
      
      // Delivery information
      delivery: {
        methodTitle: item.delivery?.methodTitle || "N/A",
        cost: item.delivery?.cost || 0
      },
      
      // Payment information
      payment: {
        paymentType: item.payment?.paymentType || "N/A",
        totalAmount: item.payment?.totalAmount || 0
      },
      
      // Timestamps
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      
      // Agent information
      agent: {
        type: item.agent?.type || "guest",
        userId: item.agent?.userId || null
      },
      
      // Legacy fields for compatibility (if needed)
      customerName: item.contact?.fullName || "N/A",
      customerEmail: item.contact?.email || "N/A",
      totalAmount: item.payment?.totalAmount || 0,
      
      // Include original data for details view
      _original: item
    };
  }
  
  if (resource === "customers") {
    // Handle different data structures for list vs detail views
    if (item.personalInfo) {
      // This is detailed customer data from getOne endpoint
    return {
      id: item.customerId,
      customerId: item.customerId,
      serialNumber: item.serialNumber,
        fullName: item.personalInfo.fullName,
        email: item.personalInfo.email,
        phoneNumber: item.personalInfo.phoneNumber,
        address: item.personalInfo.address,
        country: item.country || (item.phone ? item.phone.country : null) || null,
        countryCallingCode: item.countryCallingCode || (item.phone ? item.phone.countryCallingCode : null) || null,
        // Status information
        verified: item.status.isVerified,
        suspended: item.status.isSuspended,
        role: item.status.role,
        suspensionDetails: item.status.suspensionDetails,
        // Order statistics
        orderCount: item.orderStats.totalOrders,
        totalSpent: item.orderStats.totalSpent,
        averageOrderValue: item.orderStats.averageOrderValue,
        lastOrderDate: item.orderStats.lastOrderDate,
        // Account information
        formattedRegistration: item.accountInfo.registrationDate ? 
          new Date(item.accountInfo.registrationDate).toLocaleDateString() : 'N/A',
        lastLogin: item.accountInfo.lastLogin ? 
          new Date(item.accountInfo.lastLogin).toLocaleDateString() : 'N/A',
        lastLoginRelative: item.accountInfo.lastLoginRelative || null,
        lastLoginFormatted: item.accountInfo.lastLoginFormatted || null,
        lastLoginIP: item.accountInfo.lastLoginIP,
        // For compatibility with existing show page
        _id: item.customerId,
      data: {
          firstName: item.personalInfo.firstName,
          lastName: item.personalInfo.lastName,
          auth: {
            email: {
              local: item.personalInfo.email?.split('@')[0] || '',
              domain: item.personalInfo.email?.split('@')[1] || ''
            }
          },
          personal: {
            firstName: item.personalInfo.firstName,
            lastName: item.personalInfo.lastName,
            address: item.personalInfo.address
          }
        }
      };
    } else {
      // This is list data from getList endpoint
      return {
        id: item.id,
        customerId: item.id,
        serialNumber: item.serialNumber,
        firstName: item.firstName,
        lastName: item.lastName,
        fullName: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A',
        email: item.email,
        phoneNumber: item.phoneNumber || null, // Map the phoneNumber field from API
        country: item.country || (item.phone ? item.phone.country : null) || null,
        countryCallingCode: item.countryCallingCode || (item.phone ? item.phone.countryCallingCode : null) || null,
        ordersCount: item.ordersCount || 0, // Map the ordersCount field from API
        isVerified: item.isVerified ?? false,
        isSuspended: item.isSuspended ?? false,
        createdAt: item.createdAt || null,
        lastLogin: item.lastLogin || null,
        lastLoginRelative: item.lastLoginRelative || null,
        lastLoginFormatted: item.lastLoginFormatted || null,
        // For table rowKey and compatibility
        _id: item.id,
      };
    }
  }
  
  if (resource === "leads") {
    // Transform leads data to match expected structure
    return {
      id: item.id,
      _id: item.id, // For table rowKey
      name: item.name,
      surname: item.surname,
      email: item.email,
      phone: item.phone,
      message: item.message,
      metadata: item.metadata,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      // Additional computed fields for the table
      fullName: `${item.name || ''} ${item.surname || ''}`.trim(),
      useCase: item.metadata?.useCase,
    };
  }
  
  if (resource === "reviews") {
    // Transform reviews data to match expected structure
    return {
      id: item.reviewId,
      _id: item.reviewId, // For table rowKey
      reviewId: item.reviewId,
      productId: item.productId,
      productTitle: item.productTitle,
      productSerialNumber: item.productSerialNumber,
      review: item.review,
      rating: item.rating,
      orderId: item.orderId,
      orderSerialNumber: item.orderSerialNumber,
      reviewedAt: item.reviewedAt,
      unitsCount: item.unitsCount,
      price: item.price,
      productImageId: item.productImageId,
      // Additional computed fields
      customerName: "Customer", // Reviews don't expose customer names for privacy
      status: item.suspended ? "suspended" : "active",
    };
  }
  
  if (resource === "delivery-methods") {
    // Transform delivery methods data to match expected structure
    // Backend response: { deliveryMethodId, title, type, serialNumber, logoFileId, price, estimation, location, isSuspended, createdAt }
    return {
      id: item.deliveryMethodId,
      _id: item.deliveryMethodId, // For table rowKey
      deliveryMethodId: item.deliveryMethodId,
      serialNumber: item.serialNumber,
      title: item.title,
      type: item.type,
      logoFileId: item.logoFileId,
      price: item.price,
      estimation: item.estimation,
      location: item.location || [],
      isSuspended: item.isSuspended,
      createdAt: item.createdAt,
      
      // Nested data structure for compatibility with existing page
      data: {
        title: item.title,
        type: item.type,
        unitPrice: item.price,
        estimation: item.estimation ? parseInt(item.estimation.split(' ')[0]) : 0, // Extract number from "X days"
        logoFileId: item.logoFileId
      },
      metadata: {
        isSuspended: item.isSuspended,
        serialNumber: item.serialNumber
      }
    };
  }

  if (resource === "blog" || resource === "blog-posts") {
    // Transform blog posts data to match expected structure
    return {
      id: item.blogPostId || item.id,
      _id: item.blogPostId || item.id, // For table rowKey
      blogPostId: item.blogPostId || item.id,
      title: item.title,
      slug: item.slug,
      content: item.content,
      excerpt: item.excerpt,
      author: item.author,
      status: item.status || "draft",
      published: item.published || false,
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      featuredImage: item.featuredImage,
      tags: item.tags || [],
      categories: item.categories || [],
      // Additional computed fields
      wordCount: item.content ? item.content.split(' ').length : 0,
      readingTime: item.content ? Math.ceil(item.content.split(' ').length / 200) : 0, // ~200 words per minute
    };
  }
  
  if (resource === "products") {
    // Ensure the product has an id field for refine
    return { id: item._id || item.id, ...item };
  }
  
  return item;
};

const API_BASE = "/api/admin";

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    console.log(`🔍 getList called for resource: ${resource}`);
    console.log("📋 Parameters:", { resource, pagination, filters, sorters, meta });
    
    let url = `${API_BASE}/${resource}`;
    if (resource === "products") {
      url = `${API_BASE}/products`;
    }
    console.log(`🎯 Using endpoint: ${url}`);
    
    const query: any = {
      limit: pagination?.pageSize || 10,
      skip: ((pagination?.current || 1) - 1) * (pagination?.pageSize || 10),
    };

    if (sorters) {
      query.sortBy = sorters[0]?.field;
      query.ascending = sorters[0]?.order === "asc" ? "true" : "false";
    }

    if (filters) {
      filters.forEach((filter) => {
        if (filter.operator === "eq") {
          query[filter.field] = filter.value;
        }
      });
    }

    try {
      if (resource === "brands") {
        const { data } = await api.get(url);
        const transformedData = Array.isArray(data.brands) 
          ? data.brands.map((item: any) => transformData(resource, item))
          : [];
        return {
          data: transformedData,
          total: transformedData.length,
        };
      }
      if (resource === "products") {
        const { data } = await api.get(url, { params: query });
        return {
          data: data.data.products,
          total: data.data.pagination.total,
        };
      }
      const { data } = await api.get(url, { params: query });
      const responseData = data.data || data.orders || data.deliveryMethods || data.bankAccounts || data.leads || data.reviews || data.posts || data.files || data.catalogs || data;
      const totalCount = data.count || data.counts?.all || data.total || (Array.isArray(responseData) ? responseData.length : 0);
      const transformedData = Array.isArray(responseData) 
        ? responseData.map((item: any) => transformData(resource, item))
        : [];
      return {
        data: transformedData,
        total: totalCount,
      };
    } catch (error: any) {
      console.error(`Error in getList for resource ${resource}:`, error);
      safeNotificationError({
        message: "Error",
        description: getErrorMessage(error),
      });
      return {
        data: [],
        total: 0,
        error,
      };
    }
  },

  getOne: async ({ resource, id, meta }) => {
    let url = `${API_BASE}/${resource}/${id}`;
    // Use correct admin endpoint for products to ensure variants are included
    if (resource === "products") {
      url = `${API_BASE}/products/${id}`;
    }
    try {
      const { data } = await api.get(url);
      return {
        data: transformData(resource, data.data?.product || data.data || data),
      };
    } catch (error: any) {
      console.error(`Error fetching ${resource} ${id}:`, error);
      safeNotificationError({
        message: "Error",
        description: getErrorMessage(error),
      });
      throw error;
    }
  },

  create: async ({ resource, variables, meta }) => {
    let url = `${API_BASE}/${resource}`;
    if (resource === "products") {
      url = `${API_BASE}/products`;
    }
    
    try {
      if (resource === "brands") {
        const { data } = await api.post(`/management/brands`, variables);
        return {
          data: transformData(resource, data.data || data),
        };
      }
      if (resource === "products") {
        const { data } = await api.post(url, variables);
        return {
          data: transformData(resource, data.data?.product || data.data || data),
        };
      }
      const { data } = await api.post(`${url}/add`, variables);
      return {
        data: transformData(resource, data.data || data),
      };
    } catch (error: any) {
      console.error(`Error creating ${resource}:`, error);
      safeNotificationError({
        message: "Error",
        description: getErrorMessage(error),
      });
      throw error;
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    let url = `${API_BASE}/${resource}/${id}`;
    if (resource === "products") {
      url = `${API_BASE}/products/${id}`;
    }
    
    try {
      if (resource === "brands") {
        const { data } = await api.put(`/management/brands/${id}`, variables);
        return {
          data: transformData(resource, data.data || data),
        };
      }
      const { data } = await api.put(`${url}`, variables);
      return {
        data: transformData(resource, data.data || data),
      };
    } catch (error: any) {
      console.error(`Error updating ${resource} ${id}:`, error);
      safeNotificationError({
        message: "Error",
        description: getErrorMessage(error),
      });
      throw error;
    }
  },

  deleteOne: async ({ resource, id, meta }) => {
    let url = `${API_BASE}/${resource}/${id}`;
    if (resource === "products") {
      url = `${API_BASE}/products/${id}`;
    }
    
    try {
      if (resource === "brands") {
        const { data } = await api.delete(`/management/brands/${id}`);
        return {
          data: transformData(resource, data.data || data),
        };
      }
      const { data } = await api.delete(url);
      return {
        data: transformData(resource, data.data || data),
      };
    } catch (error: any) {
      console.error(`Error deleting ${resource} ${id}:`, error);
      safeNotificationError({
        message: "Error",
        description: getErrorMessage(error),
      });
      throw error;
    }
  },

  getApiUrl: () => "http://localhost:3000/api",

  // Custom methods for specific DikaFood operations
  custom: async ({ url, method, payload }) => {
    let response;
    switch (method) {
      case 'get':
        response = await api.get(url, { params: payload });
        break;
      default:
        throw new Error(`Unsupported custom method: ${method}`);
    }
    return response;
  },
};

// Custom function to get customer cart
export const getCustomerCart = async (customerId: string) => {
  try {
    const { data } = await api.get(`/management/customers/${customerId}/cart`);
    return {
      success: true,
      data: data.data || data,
    };
  } catch (error: any) {
    console.error(`Error fetching customer cart:`, error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      data: { items: [], total: 0 },
    };
  }
};

// Custom email functions
export const getEmailTemplates = async () => {
  try {
    const { data } = await api.get('/management/email/templates');
    return {
      success: true,
      data: data.data || [],
    };
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: [],
    };
  }
};

export const sendCustomEmail = async (customerId: string, emailData: {
  subject: string;
  templateId: string;
  templateData?: Record<string, any>;
  customContent?: string;
  senderName?: string;
}) => {
  try {
    const { data } = await api.post(
      `/management/customers/${customerId}/send-email`,
      emailData,
      { withCredentials: true }
    );
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Email sent successfully',
    };
  } catch (error: any) {
    console.error('Error sending custom email:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: null,
    };
  }
};

export const sendBulkCustomEmails = async (emailData: {
  customerIds: string[];
  subject: string;
  templateId: string;
  templateData?: Record<string, any>;
  customContent?: string;
  senderName?: string;
}) => {
  try {
    const { data } = await api.post(
      '/management/customers/bulk-email',
      emailData,
      { withCredentials: true }
    );
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Bulk emails sent successfully',
    };
  } catch (error: any) {
    console.error('Error sending bulk custom emails:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: null,
    };
  }
};

// Custom session functions
export const getCustomerSessions = async (customerId: string, params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
}) => {
  try {
    const { data } = await api.get(
      `/management/customers/${customerId}/sessions`,
      { 
        params,
        withCredentials: true 
      }
    );
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Sessions retrieved successfully',
    };
  } catch (error: any) {
    console.error('Error fetching customer sessions:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: { sessions: [], pagination: { total: 0 } },
    };
  }
};

export const getCustomerSessionStats = async (customerId: string) => {
  try {
    const { data } = await api.get(
      `/management/customers/${customerId}/sessions/stats`,
      { withCredentials: true }
    );
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Session statistics retrieved successfully',
    };
  } catch (error: any) {
    console.error('Error fetching customer session stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: null,
    };
  }
};

export const terminateCustomerSession = async (customerId: string, sessionId: string) => {
  try {
    const { data } = await api.delete(
      `/management/customers/${customerId}/sessions/${sessionId}`,
      { withCredentials: true }
    );
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Session terminated successfully',
    };
  } catch (error: any) {
    console.error('Error terminating customer session:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: null,
    };
  }
};

export default dataProvider;