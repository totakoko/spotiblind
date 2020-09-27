import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { config } from './config.js'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import { SpotifyClient } from './services/spotify'
import ServicesPlugin from './plugins/services'
import { SettingsService } from './services/settings'

Vue.config.productionTip = false

config.redirectURI = `${location.origin}/login`

;(async () => {
  const settings = new SettingsService()
  const spotifyClient = new SpotifyClient(config)
  await spotifyClient.init()

  Vue.use(ServicesPlugin, {
    settings,
    spotifyClient
  })
  new Vue({
    router,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
})()
