import { defineConfig } from 'vite'
import ViteComponents from 'vite-plugin-components'
import vue from '@vitejs/plugin-vue'
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import { VitePWA } from 'vite-plugin-pwa'

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
    ViteIcons(),
    VitePWA({
      manifest: {
        name: "SpotiBlind",
        short_name: "SpotiBlind",
        display: "fullscreen",
        background_color: "#ffffff",
        lang: "en",
        scope: "/",
        start_url: "/"
      }
    })
  ]
})
