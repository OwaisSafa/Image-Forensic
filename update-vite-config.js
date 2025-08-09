#!/usr/bin/env node

/**
 * Dynamic Vite Config Updater
 * Updates vite.config.ts to allow the current Cloudflare tunnel hostname
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateViteConfig(cloudflareUrl) {
  const viteConfigPath = path.join(__dirname, 'vite.config.ts');
  
  // Extract hostname from Cloudflare URL
  const hostname = cloudflareUrl.replace('https://', '').replace('http://', '');
  
  const newConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      port: 5173,
    },
    // Allow all hosts including dynamic Cloudflare tunnel domains
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '${hostname}',
      // Allow any trycloudflare.com subdomain
      /.*\\.trycloudflare\\.com$/,
      // Allow all hosts as fallback
      'all'
    ],
    // Additional headers for better compatibility
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    },
  },
});
`;

  fs.writeFileSync(viteConfigPath, newConfig);
  console.log(`✅ Updated vite.config.ts to allow ${hostname}`);
}

// Get Cloudflare URL from command line argument
const cloudflareUrl = process.argv[2];
if (!cloudflareUrl) {
  console.error('❌ Usage: node update-vite-config.js <cloudflare-url>');
  process.exit(1);
}

updateViteConfig(cloudflareUrl);
