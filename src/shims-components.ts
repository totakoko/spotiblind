import { SettingsService } from './services/settings'
import { SpotifyClient } from './services/spotify/client'

export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $settings: SettingsService
    $spotifyClient: SpotifyClient
  }
}
