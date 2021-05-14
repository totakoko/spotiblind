import { defineConfig } from 'vite'
import ViteComponents from 'vite-plugin-components'
import vue from '@vitejs/plugin-vue'
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080
  },
  plugins: [
    vue(),
    ViteComponents({
      customComponentResolvers: ViteIconsResolver({
        componentPrefix: 'icon'
      }),
    }),
    ViteIcons()
  ]
})
