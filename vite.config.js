import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        product: resolve(__dirname, 'product.html'),
        admin_dashboard: resolve(__dirname, 'admin/index.html'),
        admin_login: resolve(__dirname, 'admin/login.html'),
        admin_products: resolve(__dirname, 'admin/products.html'),
        admin_product_editor: resolve(__dirname, 'admin/product-editor.html'),
        admin_accessories: resolve(__dirname, 'admin/accessories.html'),
        admin_accessory_editor: resolve(__dirname, 'admin/accessory-editor.html'),
        admin_categories: resolve(__dirname, 'admin/categories.html'),
        admin_inquiries: resolve(__dirname, 'admin/inquiries.html'),
        admin_inquiry_detail: resolve(__dirname, 'admin/inquiry-detail.html'),
        admin_media: resolve(__dirname, 'admin/media.html'),
        admin_content: resolve(__dirname, 'admin/content.html'),
        admin_settings: resolve(__dirname, 'admin/settings.html')
      },
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/analytics', 'firebase/firestore', 'firebase/auth']
        }
      }
    }
  }
});
