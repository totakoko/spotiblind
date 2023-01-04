// needed to avoind overwriting exports from 'vue'
// see https://vuejs.org/guide/typescript/options-api.html#augmenting-global-properties
import { SpotifyClient } from './services/spotify/client'
import { SettingsService } from './services/settings'

export {}
declare module 'vue' {
  interface ComponentCustomProperties {
    $settings: SettingsService
    $spotifyClient: SpotifyClient
  }
}
