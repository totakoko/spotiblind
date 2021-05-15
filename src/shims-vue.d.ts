declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import { SettingsService } from './services/settings'
import { SpotifyClient } from './services/spotify'
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $settings: SettingsService
    $spotifyClient: SpotifyClient
  }
}
