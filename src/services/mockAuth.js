// Mock users for testing authentication without a backend
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@dikafood.com',
    password: 'admin123',
    role: 'manager'
  },
  {
    id: 2,
    name: 'Test User',
    email: 'test@dikafood.com',
    password: 'test123',
    role: 'manager'
  },
  {
    id: 3,
    name: 'Customer',
    email: 'customer@example.com',
    password: 'customer',
    role: 'customer'
  }
];

// Store authenticated user in sessionStorage
const setAuthUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  sessionStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
};

// Get authenticated user from sessionStorage
const getAuthUser = () => {
  const user = sessionStorage.getItem('authUser');
  return user ? JSON.parse(user) : null;
};

// Clear authenticated user from sessionStorage
const clearAuthUser = () => {
  sessionStorage.removeItem('authUser');
};

// Mock login function
const login = (email, password) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      const user = mockUsers.find(
        (user) => user.email === email && user.password === password
      );

      if (user) {
        setAuthUser(user);
        resolve({ 
          success: true, 
          data: { 
            user: { ...user, password: undefined },
            agent: { type: user.role } 
          } 
        });
      } else {
        reject({ success: false, error: 'Invalid email or password' });
      }
    }, 500); // Simulate 500ms delay
  });
};

// Mock logout function
const logout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      clearAuthUser();
      resolve({ success: true });
    }, 300);
  });
};

// Check if user is authenticated
const checkAuth = (agentType = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getAuthUser();
      
      if (!user) {
        resolve({ error: 'Not authenticated' });
        return;
      }

      if (agentType && user.role !== agentType) {
        resolve({ error: 'Insufficient permissions' });
        return;
      }

      resolve({ 
        success: true, 
        data: { 
          user: user,
          agent: { type: user.role } 
        } 
      });
    }, 300);
  });
};

// Mock registration function
const register = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if user with email already exists
      const existingUser = mockUsers.find(user => user.email === userData.email);
      
      if (existingUser) {
        reject({ success: false, error: 'User with this email already exists' });
        return;
      }
      
      // Create new user
      const newUser = {
        id: mockUsers.length + 1,
        ...userData,
        role: 'customer' // Default role for new registrations
      };
      
      // Add to mock database
      mockUsers.push(newUser);
      
      resolve({ success: true, message: 'Registration successful' });
    }, 500);
  });
};

export const mockAuthService = {
  login,
  logout,
  checkAuth,
  register,
  getAuthUser
}; 