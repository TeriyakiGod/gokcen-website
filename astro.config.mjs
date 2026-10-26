import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://gokcen.example',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
