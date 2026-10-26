import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://gokcen.kacperochnik.eu',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
