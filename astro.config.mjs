import dotenv from 'dotenv'
import vercel from '@astrojs/vercel'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

dotenv.config()

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
  },
  vite: {
    optimizeDeps: {
      exclude: ['oslo'],
    },
  },
})
