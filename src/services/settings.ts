const LOCAL_STORAGE_SETTINGS_KEY = 'spotiblind-settings'

export interface Settings {
  listenDuration: number
  numberOfTracks: number
  pauseDuration: number
}

export const defaultSettings: Settings = {
  listenDuration: 20,
  numberOfTracks: 10,
  pauseDuration: 5
}

export class SettingsService {
  settings: Settings = defaultSettings

  constructor () {
    const settings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY)
    if (settings) {
      try {
        this.settings = JSON.parse(settings)
      } catch (e) {
        console.log('could not parse settings', e, 'settings=', settings)
      }
    }
  }

  save () {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(this.settings))
  }

  reset () {
    Object.assign(this.settings, defaultSettings)
  }
}
