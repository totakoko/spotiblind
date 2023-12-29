import type { InjectionKey } from 'vue'
import type { SettingsService } from './services/settings'
import type { SpotifyClient } from './services/spotify/client'

export const SETTINGS_SERVICE: InjectionKey<SettingsService> = Symbol('SETTINGS_SERVICE')
export const SPOTIFY_CLIENT: InjectionKey<SpotifyClient> = Symbol('SPOTIFY_CLIENT')
