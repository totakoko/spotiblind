import 'modern-css-reset'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import { routes } from './routes'

import { SettingsService } from './services/settings'
import { SpotifyClient } from './services/spotify/client'
import { config } from './config'

;(async () => {
  const settings = new SettingsService()
  const spotifyClient = new SpotifyClient(config)
  await spotifyClient.init()

  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  const app = createApp(App)
  app.use(router)
  app.config.globalProperties.$settings = settings
  app.config.globalProperties.$spotifyClient = spotifyClient
  app.mount('#app')
})().catch(e => {
  console.error(e)
})
