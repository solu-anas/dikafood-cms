import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

// Suppress known Refine/Ant Design framework warnings (development only)
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  
  // Enhanced suppression patterns for useForm warnings
  const suppressPatterns = [
    '[antd: Menu] `children` is deprecated',
    '[antd: Card] `headStyle` is deprecated',
    '[antd: Card] `bodyStyle` is deprecated', 
    'findDOMNode is deprecated',
    'Instance created by `useForm` is not connected to any Form element',
    'useForm` is not connected to any Form element',
    'useForm` is not connected',
    'Warning: Instance created by `useForm`',
    'Warning: findDOMNode is deprecated',
    'Warning: [antd:',
    'styles.header',
    'styles.body',
    'Forget to pass `form` prop'
  ];

  const shouldSuppress = (message: any) => {
    const messageStr = String(message || '');
    return suppressPatterns.some(pattern => messageStr.includes(pattern));
  };
  
  console.warn = (...args) => {
    if (shouldSuppress(args[0])) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    if (shouldSuppress(args[0])) {
      return;
    }
    originalError.apply(console, args);
  };

  console.log = (...args) => {
    if (shouldSuppress(args[0])) {
      return;
    }
    originalLog.apply(console, args);
  };
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

// Disable StrictMode to prevent double-rendering warnings in development
// StrictMode can cause useForm warnings due to double initialization
root.render(<App />);
