import { reactive, watch } from 'vue'
import { debounce } from 'ts-debounce'

const LOCAL_STORAGE_SETTINGS_KEY = 'spotiblind:settings'

type TrackMode = 'start' | 'middle' | 'end'

export interface Settings {
  listenDuration: number
  numberOfTracks: number
  pauseDuration: number
  trackMode: TrackMode
}

export const defaultSettings: Settings = {
  listenDuration: 20,
  numberOfTracks: 10,
  pauseDuration: 5,
  trackMode: 'middle'
}

export class SettingsService {
  settings: Settings = defaultSettings

  constructor () {
    const settings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY)
    if (settings !== null) {
      try {
        this.settings = Object.assign(
          {},
          defaultSettings,
          JSON.parse(settings)
        )
      } catch (e) {
        console.log('could not parse settings', e, 'settings=', settings)
      }
    }
    this.settings = reactive(this.settings)

    watch(this.settings, debounce(() => {
      this.save()
    }, 500))
  }

  save (): void {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(this.settings))
  }

  reset (): void {
    Object.assign(this.settings, defaultSettings)
  }
}
