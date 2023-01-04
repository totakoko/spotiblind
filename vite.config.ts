import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080
  },
  plugins: [
    vue(),
    Components({
      resolvers: [
        IconsResolver({
          prefix: 'icon'
        })
      ],
      dts: 'src/components.d.ts'
    }),
    Icons(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SpotiBlind',
        short_name: 'SpotiBlind',
        display: 'fullscreen',
        background_color: '#ffffff',
        lang: 'en',
        scope: '/',
        start_url: '/'
      }
    })
  ]
})
