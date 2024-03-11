import dotenv from 'dotenv'
import node from '@astrojs/node'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

dotenv.config()

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'middleware'
  }),
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
