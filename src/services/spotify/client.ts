import type { ComputedRef, ShallowRef } from 'vue'
import { computed, shallowRef } from 'vue'
import { generateRandomString, pkceChallengeFromVerifier } from './helpers'
import type { Category, Device, PKCE, Playlist, State, Track } from './types'

const LOCAL_STORAGE_AUTHENTICATION_KEY = 'spotiblind:authentication'
const LOCAL_STORAGE_PKCE_KEY = 'spotiblind:pkce'
const LOCAL_STORAGE_REDIRECT_URI_KEY = 'spotiblind:redirect-uri'

// mandatory scopes for spotiblind to work:
// update the player state and access private content
const spotifyAPIScopes = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
]

const devicesCheckRoutineInterval = 5000

export interface SpotifyClientConfig {
  authURL?: string
  apiURL?: string
  locale?: string
  clientId: string
  redirectURI: string
}

export type PrivateSpotifyClientConfig = Required<SpotifyClientConfig>

export class SpotifyClient {
  private readonly config: PrivateSpotifyClientConfig
  private state: State
  private devicesCheckRoutineTimeout = -1

  private readonly devices: ShallowRef<Device[]> = shallowRef<Device[]>([])

  public readonly deviceReady: ComputedRef<boolean> = computed<boolean>(() => {
    return this.devices.value.filter(d => d.is_active).length > 0
  })

  constructor(config: SpotifyClientConfig) {
    this.config = Object.assign(
      {
        apiURL: 'https://api.spotify.com/v1', // without trailing slash
        authURL: 'https://accounts.spotify.com', // without trailing slash
        locale: 'fr',
      },
      config,
    )

    const state = localStorage.getItem(LOCAL_STORAGE_AUTHENTICATION_KEY)
    if (state !== null) {
      try {
        this.state = JSON.parse(state)
      } catch (e) {
        throw new Error(`could not parse state: ${(e as Error)?.message}`)
      }
    } else {
      this.state = {
        accessToken: '',
        refreshToken: '',
        accessTokenExpiration: 0,
      }
    }
  }

  async init(): Promise<void> {
    const urlSearchParams = new URLSearchParams(window.location.search)
    const code = urlSearchParams.get('code')
    const state = urlSearchParams.get('state')
    if (code !== null && state !== null) {
      const { codeVerifier, csrfToken } = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PKCE_KEY) as string) as PKCE
      if (state !== csrfToken) {
        throw new Error(`invalid csrf token: ${state}, expected ${csrfToken}`)
      }

      await this.authorize(code, codeVerifier)
      localStorage.removeItem(LOCAL_STORAGE_PKCE_KEY)
      window.history.replaceState('', document.title, localStorage.getItem(LOCAL_STORAGE_REDIRECT_URI_KEY) ?? '/')
      localStorage.removeItem(LOCAL_STORAGE_REDIRECT_URI_KEY)
    }

    if (await this.tryAuthentication()) {
      await this.checkDevices()
    }
  }

  start(): void {
    this.devicesCheckRoutineTimeout = window.setInterval(
      this.checkDevices,
      devicesCheckRoutineInterval,
    )
  }

  stop(): void {
    clearInterval(this.devicesCheckRoutineTimeout)
  }

  // see https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce
  async redirectToSpotifyLogin(): Promise<void> {
    const csrfToken = generateRandomString(40)
    const codeVerifier = generateRandomString(43)
    localStorage.setItem(LOCAL_STORAGE_PKCE_KEY, JSON.stringify({
      codeVerifier,
      csrfToken,
    }))
    const codeChallenge = await pkceChallengeFromVerifier(codeVerifier)

    const searchParams = Object.entries({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectURI,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: csrfToken,
      scope: spotifyAPIScopes.join(','),
    })
      .map(([key, value]) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      })
      .join('&')

    const url = `${this.config.authURL}/authorize?${searchParams}`
    localStorage.setItem(LOCAL_STORAGE_REDIRECT_URI_KEY, new URL(window.location.href).searchParams.get('redirect') ?? '/')
    window.location.assign(url)
  }

  async authorize(code: string, codeVerifier: string): Promise<void> {
    const searchParams = Object.entries({
      client_id: this.config.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectURI,
      code_verifier: codeVerifier,
    })
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')

    const res = await fetch(`${this.config.authURL}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: searchParams,
    })
    const body = await res.json()
    this.state = {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      accessTokenExpiration: Math.floor(Date.now() / 1000) + (body.expires_in as number),
    }
    this.saveState()
  }

  logout(): void {
    this.state = {
      accessToken: '',
      refreshToken: '',
      accessTokenExpiration: 0,
    }
    this.saveState()
  }

  async tryAuthentication(): Promise<boolean> {
    if (this.state.accessToken !== '') {
      if (this.state.accessTokenExpiration > Date.now() / 1000) {
        // validate the access token
        try {
          await this.getUserProfile()

          // set a timer to refresh the access token 10 minutes before expiration
          const remainingValidity = this.state.accessTokenExpiration - Math.floor(Date.now() / 1000)
          setTimeout(async () => {
            await this.refreshAccessToken()
          }, (remainingValidity - 600) * 1000)
          return true
        } catch (error) {
          console.error('could not get user profile', error)
        }
      }
      try {
        // the access token has expired
        await this.refreshAccessToken()
        return true
      } catch (error) {
        // refresh token may be wrong
        console.error('could not refresh access token', error)
        this.logout()
      }
    }
    return false
  }

  isLoggedIn(): boolean {
    return this.state.accessToken.length > 0
  }

  async refreshAccessToken(): Promise<void> {
    const searchParams = Object.entries({
      client_id: this.config.clientId,
      grant_type: 'refresh_token',
      refresh_token: this.state.refreshToken,
    })
      .map(([key, value]) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      })
      .join('&')
    const res = await fetch(`${this.config.authURL}/api/token`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      method: 'POST',
      body: searchParams,
    })
    this.ensureValidResponse(res)
    const result = await res.json()

    this.state.accessToken = result.access_token
    this.state.refreshToken = result.refresh_token
    this.state.accessTokenExpiration = Math.floor(Date.now() / 1000) + (result.expires_in as number)
    this.saveState()

    // refresh the access token 10 minutes before expiration
    setTimeout(async () => {
      await this.refreshAccessToken()
    }, (result.expires_in - 600) * 1000)
  }

  async getUserProfile(): Promise<any> {
    const res = await fetch(`${this.config.apiURL}/me`, {
      headers: this.getAuthHeaders(),
      method: 'GET',
    })
    this.ensureValidResponse(res)
  }

  async getPlaylist(playlistID: string): Promise<any> {
    const playlist = await this.fetchAllItems(`${this.config.apiURL}/playlists/${playlistID}`, 'tracks', 100)
    return {
      id: playlist.id,
      name: playlist.name,
      image: playlist.images?.[0]?.url,
      tracks: playlist.tracks.items
        .filter((track: any) => track.track !== null) // some tracks may be null
        .map((track: any): Track => {
          return {
            id: track.track.id,
            name: track.track.name,
            artists: track.track.artists.map((artist: any) => artist.name),
            duration: track.track.duration_ms,
          }
        }),
    }
  }

  async getCategories(): Promise<Category[]> {
    const body = await this.fetchAllItems(`${this.config.apiURL}/browse/categories?locale=${this.config.locale}`, 'categories', 50)
    return body.categories.items.map((category: any) => {
      return {
        id: category.id,
        name: category.name.replace(/\//, ' / '),
        image: category.icons[0].url,
      }
    })
  }

  async getCategory(categoryId: string): Promise<Category> {
    const res = await fetch(
      `${this.config.apiURL}/browse/categories/${categoryId}?locale=${this.config.locale}`,
      {
        headers: this.getAuthHeaders(),
      },
    )
    this.ensureValidResponse(res)
    return await res.json()
  }

  async getCategoryPlaylists(categoryId: string): Promise<Playlist[]> {
    const body = await this.fetchAllItems(`${this.config.apiURL}/browse/categories/${categoryId}/playlists?country=fr`, 'playlists', 50)
    return body.playlists.items
      .filter((playlist: any) => playlist !== null) // some playlist may be null
      .map((playlist: any) => {
        return {
          id: playlist.id,
          name: playlist.name.replace(/\//, ' / '),
          image: playlist.images[0].url,
        }
      })
  }

  async getUserPlaylists(): Promise<Playlist[]> {
    const body = await this.fetchAllItems(`${this.config.apiURL}/me/playlists`, 'items', 50)
    return body.items
      .filter((playlist: any) => playlist !== null) // some playlists may be null
      .map((playlist: any) => {
        return {
          id: playlist.id,
          name: playlist.name.replace(/\//, ' / '),
          image: playlist.images[0]?.url,
        }
      })
  }

  async getAvailableDevices(): Promise<Device[]> {
    const res = await fetch(`${this.config.apiURL}/me/player/devices`, {
      headers: this.getAuthHeaders(),
    })
    this.ensureValidResponse(res)
    return (await res.json()).devices
  }

  async transferPlayback(deviceId: string): Promise<void> {
    const res = await fetch(`${this.config.apiURL}/me/player`, {
      headers: this.getAuthHeaders(),
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    })
    this.ensureValidResponse(res)
  }

  async play(trackID: string, startPosition = 0): Promise<void> {
    const res = await fetch(`${this.config.apiURL}/me/player/play`, {
      headers: this.getAuthHeaders(),
      method: 'PUT',
      body: JSON.stringify({
        uris: [`spotify:track:${trackID}`],
        position_ms: startPosition,
      }),
    })
    this.ensureValidResponse(res)
  }

  async pause(): Promise<void> {
    const res = await fetch(`${this.config.apiURL}/me/player/pause`, {
      headers: this.getAuthHeaders(),
      method: 'PUT',
    })
    // 403 means the device is already paused
    if (res.status !== 403) {
      this.ensureValidResponse(res)
    }
  }

  async fetchAllItems(url: string, collectionKey: string, limit: number): Promise<any> {
    if (!url.includes('?')) {
      url += '?'
    }

    const res = await fetch(`${url}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    })
    this.ensureValidResponse(res)
    const body = await res.json()
    const collection = body[collectionKey]
    if (collection.total > limit) {
      const additionalPagesCount = Math.ceil(
        (collection.total - limit) / limit,
      )
      const additionalBodies = await Promise.all(
        Array(additionalPagesCount)
          .fill(0)
          .map(async (_, index) => {
            const res = await fetch(
              `${url}&limit=${limit}&offset=${(index + 1) * limit}`,
              {
                headers: this.getAuthHeaders(),
              },
            )
            this.ensureValidResponse(res)
            return await res.json()
          }),
      )
      additionalBodies.forEach((body) => {
        collection.items.push(...body[collectionKey].items)
      })
    }
    return body
  }

  checkDevices = async (): Promise<void> => {
    try {
      const devices: Device[] = this.devices.value = await this.getAvailableDevices()
      if (devices.length === 0) {
        console.warn('no device found')
        this.devices.value = []
        return
      }

      // if all devices are inactive, select the first
      if (devices.every(device => !device.is_active)) {
        await this.transferPlayback(devices[0].id)
      }
    } catch (error) {
      console.error('could not get devices', error)
      this.devices.value = []
    }
  }

  private ensureValidResponse(response: Response): void {
    if (!response.status.toFixed().startsWith('2')) {
      throw new Error(`Invalid response: ${response.statusText}`)
    }
  }

  private saveState(): void {
    localStorage.setItem(LOCAL_STORAGE_AUTHENTICATION_KEY, JSON.stringify(this.state))
  }

  private getAuthHeaders(): any {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.state.accessToken}`,
    }
  }
}
