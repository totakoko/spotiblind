import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { config } from './config'
import { SETTINGS_SERVICE, SPOTIFY_CLIENT } from './injects'
import { SettingsService } from './services/settings'
import { SpotifyClient } from './services/spotify/client'
import { routes } from './routes'

import '@unocss/reset/tailwind.css'
import 'uno.css'

(async () => {
  const settings = new SettingsService()
  const spotifyClient = new SpotifyClient(config)
  await spotifyClient.init()
  const app = createApp(App)
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })
  app.use(router)
  app.provide(SETTINGS_SERVICE, settings)
  app.provide(SPOTIFY_CLIENT, spotifyClient)
  app.mount('#app')
})().catch((e) => {
  console.error(e)
})
