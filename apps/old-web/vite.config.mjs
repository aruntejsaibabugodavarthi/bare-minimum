import { resolve, dirname } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Auto-detect all HTML files in the public directory
const publicDir = resolve(__dirname, 'public');
const htmlFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.html'));
const input = {};
htmlFiles.forEach(file => {
  const name = file.replace(/\.html$/, '');
  input[name] = resolve(publicDir, file);
});

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input
    }
  }
});
