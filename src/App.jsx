// import { PiClipboardText, PiGridFour } from 'react-icons/pi';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createContext, useEffect, useMemo, useState } from 'react';
import config from './config';

// Import styles
import './reset.scss';
import './global.scss';
import './fonts.scss';
import './App.scss';

// Import layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Import pages
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ProductsPage from './features/products/pages/ProductsPage';
import TestComponents from './pages/TestComponents';

// Create a placeholder component for pages not yet implemented
const PlaceholderPage = ({ title }) => (
  <div className="placeholder-page">
    <h1>{title} Page</h1>
    <p>This feature is currently under development.</p>
  </div>
);

// Auth context
export const Context = createContext(false);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const validAgents = useMemo(() => ["manager", "root"], []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("agentType", "manager");
    fetch(config.API_BASE + '/auth/check?' + params.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include"
    })
      .then(response => response.json())
      .then((data) => {
        setIsChecked(true);
        if (data.error) {
          console.log(data.error);
          setIsAuthenticated(false);
          setIsManager(false)
        } else if (data.success) {
          setIsAuthenticated(true);
          if (validAgents.includes(data.data.agent.type)) {
            setIsManager(true)
          }
          else{
            setIsManager(false)
          }
        };
      })
      .catch((err) => {
        console.error("Error:", err.message);
        setIsAuthenticated(false);
      });
  }, [isAuthenticated, isChecked, isManager, validAgents]);

  return (
    <Context.Provider value={{ isAuthenticated, isChecked, setIsAuthenticated, isManager }}>
      <div className="app-container">
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/test-components" element={<TestComponents />} />

            {/* Dashboard routes - protected by DashboardLayout */}
            <Route path="/manage" element={<DashboardLayout />}>
              <Route index element={<PlaceholderPage title="Dashboard" />} />
              <Route path="orders" element={<PlaceholderPage title="Orders" />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<PlaceholderPage title="Customers" />} />
              <Route path="reviews" element={<PlaceholderPage title="Reviews" />} />
              <Route path="delivery" element={<PlaceholderPage title="Delivery" />} />
              <Route path="payment" element={<PlaceholderPage title="Payment" />} />
              <Route path="components" element={<TestComponents />} />
            </Route>

            {/* Redirect from root to dashboard or login */}
            <Route path="/" element={
              isAuthenticated && isManager ?
                <DashboardLayout /> :
                <LoginPage />
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </Context.Provider>
  );
}

export default App;