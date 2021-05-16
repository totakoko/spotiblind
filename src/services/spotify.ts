const LOCAL_STORAGE_AUTHENTICATION_KEY = 'spotiblind:authentication'

export interface SpotifyClientConfig {
  clientId: string
  clientSecret: string
  redirectURI: string
}

interface State {
  accessToken: string
  refreshToken: string
  accessTokenExpiration: number
}

export interface Category {
  id: string
  name: string
  image: string
}

export interface Playlist {
  id: string
  name: string
  image: string

  tracks?: Track[]
}

export interface Track {
  id: string
  name: string
  author: string
  duration: number
}

const spotifyAPIScopes = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private'
]

export class SpotifyClient {
  private readonly config: SpotifyClientConfig
  private state: State

  constructor (config: SpotifyClientConfig) {
    this.config = config

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
        accessTokenExpiration: 0
      }
    }
  }

  async init (): Promise<void> {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code !== null) {
      await this.authorize(code)
      window.history.replaceState('', document.title, '/')
      return
    }

    await this.tryAuthentication()
  }

  redirectToSpotifyLogin (): void {
    const url = `https://accounts.spotify.com/authorize?client_id=${this.config.clientId}&response_type=code&redirect_uri=${this.config.redirectURI}&scope=${spotifyAPIScopes.join(',')}`
    window.location = url as any
  }

  async authorize (code: any): Promise<void> {
    const searchParams = Object.entries({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.config.redirectURI
    })
      .map(([key, value]) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value)
      }).join('&')

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: searchParams
    })
    const body = await res.json()
    this.state = {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      accessTokenExpiration: Math.floor(Date.now() / 1000) + (body.expires_in as number)
    }
    this.saveState()
  }

  logout (): void {
    this.state = {
      accessToken: '',
      refreshToken: '',
      accessTokenExpiration: 0
    }
    this.saveState()
  }

  async tryAuthentication (): Promise<boolean> {
    if (this.state.accessToken !== '') {
      // validate the access token
      try {
        await this.getUserProfile()

        // set a timer to refresh the access token 10 minutes before expiration
        const remainingValidity = Math.floor(Date.now() / 1000) - this.state.accessTokenExpiration
        setTimeout(async () => {
          await this.refreshAccessToken()
        }, (remainingValidity - 600) * 1000)
      } catch (error) {
        console.log('could not get user profile', error)
        await this.refreshAccessToken()
      }
    }
    return false
  }

  isLoggedIn (): boolean {
    return this.state.accessToken.length > 0
  }

  async refreshAccessToken (): Promise<void> {
    const searchParams = Object.entries({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: this.state.refreshToken
    })
      .map(([key, value]) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value)
      }).join('&')
    const res = await fetch('https://accounts.spotify.com/api/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      method: 'POST',
      body: searchParams
    })
    this.ensureValidResponse(res)
    const result = await res.json()

    this.state.accessToken = result.access_token
    this.state.accessTokenExpiration = Math.floor(Date.now() / 1000) + (result.expires_in as number)
    this.saveState()

    // refresh the access token 10 minutes before expiration
    setTimeout(async () => {
      await this.refreshAccessToken()
    }, (result.expires_in - 600) * 1000)
  }

  async getUserProfile (): Promise<any> {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: this.getAuthHeaders(),
      method: 'GET'
    })
    this.ensureValidResponse(res)
  }

  async getPlaylist (playlistID: string): Promise<any> {
    return await this.fetchAllItems(`https://api.spotify.com/v1/playlists/${playlistID}`, 'tracks', 100)
  }

  async getCategories (): Promise<Category[]> {
    const body = await this.fetchAllItems('https://api.spotify.com/v1/browse/categories?locale=fr', 'categories', 50)
    return body.categories.items.map((category: any) => {
      return {
        id: category.id,
        name: category.name,
        image: category.icons[0].url
      }
    })
  }

  async getCategory (categoryId: string): Promise<Category> {
    const res = await fetch(`https://api.spotify.com/v1/browse/categories/${categoryId}?locale=fr`, {
      headers: this.getAuthHeaders()
    })
    this.ensureValidResponse(res)
    return await res.json()
  }

  async getCategoryPlaylists (categoryId: string): Promise<Playlist[]> {
    const body = await this.fetchAllItems(`https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?country=fr`, 'playlists', 50)
    return body.playlists.items.map((playlist: any) => {
      return {
        id: playlist.id,
        name: playlist.name,
        image: playlist.images[0].url
      }
    })
  }

  async getUserPlaylists (): Promise<Playlist[]> {
    const body = await this.fetchAllItems('https://api.spotify.com/v1/me/playlists', 'items', 50)
    return body.items.map((playlist: any) => {
      return {
        id: playlist.id,
        name: playlist.name,
        image: playlist.images[0].url
      }
    })
  }

  async getAvailableDevices (): Promise<any> {
    const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: this.getAuthHeaders()
    })
    this.ensureValidResponse(res)
    return (await res.json()).devices
  }

  async transferPlayback (deviceId: string): Promise<void> {
    const res = await fetch('https://api.spotify.com/v1/me/player', {
      headers: this.getAuthHeaders(),
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [deviceId],
        play: true
      })
    })
    this.ensureValidResponse(res)
  }

  async play (trackID: string, startPosition = 0): Promise<void> {
    const res = await fetch('https://api.spotify.com/v1/me/player/play', {
      headers: this.getAuthHeaders(),
      method: 'PUT',
      body: JSON.stringify({
        uris: [`spotify:track:${trackID}`],
        position_ms: startPosition
      })
    })
    this.ensureValidResponse(res)
  }

  async pause (): Promise<void> {
    const res = await fetch('https://api.spotify.com/v1/me/player/pause', {
      headers: this.getAuthHeaders(),
      method: 'PUT'
    })
    this.ensureValidResponse(res)
  }

  async fetchAllItems (url: string, collectionKey: string, limit: number): Promise<any> {
    if (!url.includes('?')) {
      url += '?'
    }
    const res = await fetch(`${url}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    })
    this.ensureValidResponse(res)
    const body = await res.json()
    const collection = body[collectionKey]
    if (collection.total > limit) {
      const additionalPagesCount = Math.ceil((collection.total - limit) / limit)
      const additionalBodies = await Promise.all(
        Array(additionalPagesCount).fill(0).map(async (_, index) => {
          const res = await fetch(`${url}&limit=${limit}&offset=${(index + 1) * limit}`, {
            headers: this.getAuthHeaders()
          })
          this.ensureValidResponse(res)
          return await res.json()
        })
      )
      additionalBodies.forEach(body => {
        collection.items.push(...body[collectionKey].items)
      })
    }
    return body
  }

  private ensureValidResponse (response: Response): void {
    if (!/^2/.test(response.status.toFixed())) {
      throw new Error(`Invalid response: ${response.statusText}`)
    }
  }

  private saveState (): void {
    localStorage.setItem(LOCAL_STORAGE_AUTHENTICATION_KEY, JSON.stringify(this.state))
  }

  private getAuthHeaders (): any {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.state.accessToken}`
    }
  }
}
