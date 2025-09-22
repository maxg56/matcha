import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// CSP configuration based on environment
const cspPlugin = () => {
  return {
    name: 'csp-config',
    transformIndexHtml(html: string) {
      const isDev = process.env.NODE_ENV !== 'production'

      const devCSP = `
        default-src 'self';
        script-src 'self' https://js.stripe.com https://m.stripe.network;
        style-src 'self' 'unsafe-inline' data:;
        img-src 'self' data: blob: https:;
        connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://nominatim.openstreetmap.org ws: wss:;
        frame-src https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests
      `

      const prodCSP = `
        default-src 'self';
        script-src 'self' https://js.stripe.com https://m.stripe.network;
        style-src 'self';
        img-src 'self' data: blob: https:;
        connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://nominatim.openstreetmap.org;
        frame-src https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests
      `

      const csp = isDev ? devCSP : prodCSP

      return html.replace(
        /<meta http-equiv="Content-Security-Policy"[\s\S]*?>/,
        `<meta http-equiv="Content-Security-Policy" content="${csp.replace(/\s+/g, ' ').trim()}">`
      )
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cspPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false, // Ignore SSL certificate errors in development
        rewrite: (path) => path
      }
    }
  }
})
