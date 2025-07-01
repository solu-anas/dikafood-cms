import axios from "axios";

// Create axios instance with cookie support
const axiosInstance = axios.create({
  baseURL: "http://localhost:1025",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-App-Type": "DikaFood-CMS", // Important: This ensures proper cookie namespacing
  },
});

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  customerId?: string;
  items: CartItem[];
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

export const cartService = {
  /**
   * Get current cart
   */
  async getCart(): Promise<Cart | null> {
    try {
      const response = await axiosInstance.get(`/cart`);
      return response.data.data?.cart || response.data.cart || response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      return null;
    }
  },

  /**
   * Add item to cart
   */
  async addToCart(productId: string, variantId: string, quantity: number = 1): Promise<boolean> {
    try {
      await axiosInstance.post('/cart/items', {
        productId,
        variantId,
        quantity
      });
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: string, quantity: number): Promise<boolean> {
    try {
      await axiosInstance.put(`/cart/items/${itemId}`, {
        quantity
      });
      return true;
    } catch (error) {
      console.error("Error updating cart item:", error);
      return false;
    }
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/cart/items/${itemId}`);
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    }
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<boolean> {
    try {
      await axiosInstance.delete('/cart');
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  },

  /**
   * Get cart summary (totals and count)
   */
  async getCartSummary(): Promise<any> {
    try {
      const response = await axiosInstance.get('/cart/summary');
      return response.data.data?.summary || response.data.summary || response.data;
    } catch (error) {
      console.error("Error fetching cart summary:", error);
      return null;
    }
  },

  /**
   * Start checkout process
   */
  async startCheckout(customerId: string, itemIds: string[]): Promise<any> {
    try {
      const response = await axiosInstance.post('/checkout/session', {
        itemIds
      }, {
        headers: {
          'X-Customer-ID': customerId,
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error starting checkout:", error);
      throw error;
    }
  },

  /**
   * Add contact information to checkout
   */
  async addContactToCheckout(orderId: string, contactData: any): Promise<boolean> {
    try {
      await axiosInstance.post('/public/checkout/contact', {
        orderId,
        ...contactData
      });
      return true;
    } catch (error) {
      console.error("Error adding contact to checkout:", error);
      return false;
    }
  },

  /**
   * Add delivery information to checkout
   */
  async addDeliveryToCheckout(orderId: string, deliveryData: any): Promise<boolean> {
    try {
      await axiosInstance.post('/public/checkout/delivery', {
        orderId,
        ...deliveryData
      });
      return true;
    } catch (error) {
      console.error("Error adding delivery to checkout:", error);
      return false;
    }
  },

  /**
   * Process payment
   */
  async processPayment(orderId: string, paymentData: any): Promise<any> {
    try {
      const response = await axiosInstance.post('/public/checkout/payment', {
        orderId,
        ...paymentData
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    }
  },

  /**
   * Get delivery methods
   */
  async getDeliveryMethods(): Promise<any[]> {
    try {
      const response = await axiosInstance.get('/public/checkout/delivery/methods');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching delivery methods:", error);
      return [];
    }
  }
};

export default cartService; 