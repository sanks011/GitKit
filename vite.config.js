import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allow external access (required for Render)
    port: process.env.PORT || 5173,  // Use Render's assigned port
    proxy: {
      '/api': {
        target: 'https://gitkit-backend.onrender.com', // Adjust this if your backend is hosted elsewhere
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
