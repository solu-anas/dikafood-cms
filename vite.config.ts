import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  define: {
    // Suppress development warnings for known issues
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  server: {
    port: 5174,
    open: false, // Don't auto-open browser
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Suppress warnings during build
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.message?.includes('Use of eval')) return;
        warn(warning);
      }
    }
  },
  optimizeDeps: {
    include: ['@refinedev/antd', 'antd', '@ant-design/icons'],
  },
});
