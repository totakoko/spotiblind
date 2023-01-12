import './styles/reset.sass'
import { createApp } from 'vue'

import App from './App.vue'

import { config } from './config'
import { SETTINGS_SERVICE, SPOTIFY_CLIENT } from './injects'
import { SettingsService } from './services/settings'
import { SpotifyClient } from './services/spotify/client'
import { router } from './routes'

(async () => {
  const settings = new SettingsService()
  const spotifyClient = new SpotifyClient(config)
  await spotifyClient.init()

  const app = createApp(App)
  app.use(router)
  app.provide(SETTINGS_SERVICE, settings)
  app.provide(SPOTIFY_CLIENT, spotifyClient)
  app.mount('#app')
})().catch(e => {
  console.error(e)
})
