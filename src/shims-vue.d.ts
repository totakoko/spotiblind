import { SettingsService } from './services/settings'
import { SpotifyClient } from './services/spotify'

declare module '*.vue' {
  import { DefineComponent } from '@vue/runtime-core'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $settings: SettingsService
    $spotifyClient: SpotifyClient
  }
}
