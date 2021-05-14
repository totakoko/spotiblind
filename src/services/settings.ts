const LOCAL_STORAGE_SETTINGS_KEY = 'spotiblind-settings'

export interface Settings {
  listenDuration: number
  numberOfTracks: number
  pauseDuration: number
}

export class SettingsService {
  settings: Settings

  constructor () {
    this.settings = {
      listenDuration: 20,
      numberOfTracks: 10,
      pauseDuration: 5
    }

    const settings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY)
    if (settings) {
      try {
        this.settings = Object.assign(this.settings, JSON.parse(settings))
      } catch (e) {
        console.log('could not parse settings', e, 'settings=', settings)
      }
    }
  }

  save () {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(this.settings))
  }

  updateSetting (key: keyof Settings, value: any) {
    this.settings[key] = value
    this.save()
  }
}
