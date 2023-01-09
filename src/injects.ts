import { InjectionKey } from 'vue'
import { SettingsService } from './services/settings'
import { SpotifyClient } from './services/spotify/client'

export const SETTINGS_SERVICE: InjectionKey<SettingsService> = Symbol('SETTINGS_SERVICE')
export const SPOTIFY_CLIENT: InjectionKey<SpotifyClient> = Symbol('SPOTIFY_CLIENT')
