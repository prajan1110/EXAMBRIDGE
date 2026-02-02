import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // API_URL will be overridden by .env.production in production builds
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.NODE_ENV === 'development' ? '/api' : 'https://api.exambridge-shiksha.com/api'),
    // Default chatbot URL (will be overridden by .env.production)
    'import.meta.env.VITE_CHATBOT_URL': JSON.stringify('https://your-n8n-instance.com/webhook/d1479c26-b892-434c-ae5d-de89779dea38/chat'),
  },
}));
