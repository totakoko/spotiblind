const LOCAL_STORAGE_ACCESS_TOKEN_KEY = 'spotiblind-access-token'
const LOCAL_STORAGE_REFRESH_TOKEN_KEY = 'spotiblind-refresh-token'
const LOCAL_STORAGE_ACCESS_TOKEN_EXPIRATION_KEY = 'spotiblind-refresh-token-expiration'


export interface SpotifyClientConfig {
  clientId: string
  clientSecret: string
  redirectURI: string
}

interface InternalConfig extends SpotifyClientConfig {
  accessToken?: string
  refreshToken?: string
  accessTokenExpiration?: number
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
}

const spotifyAPIScopes = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
]

/*
config
  clientId
  clientSecret
  redirectURI

  // accessToken
  // refreshToken

*/
export class SpotifyClient {
  config: InternalConfig

  constructor (config: SpotifyClientConfig) {
    this.config = config

    const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY)
    const accessTokenExpiration = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_EXPIRATION_KEY)
    if (accessToken && refreshToken) {
      this.config.accessToken = accessToken
      this.config.refreshToken = refreshToken
      this.config.accessTokenExpiration = accessTokenExpiration as any
    }
  }

  async init () {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      await this.authorize(code)
      window.history.replaceState('', document.title, '/')
      return
    }

    await this.tryAuthentication()
  }

  redirectToSpotifyLogin () {
    const url = `https://accounts.spotify.com/authorize?client_id=${this.config.clientId}&response_type=code&redirect_uri=${this.config.redirectURI}&scope=${spotifyAPIScopes.join(',')}`
    window.location = url as any
  }

  async authorize (code: any) {
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
    this.config.accessToken = body.access_token
    this.config.refreshToken = body.refresh_token
    this.config.accessTokenExpiration = Math.floor(Date.now() / 1000) + body.expires_in
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, this.config.accessToken)
    localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, this.config.refreshToken)
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_EXPIRATION_KEY, Math.floor(Date.now() / 1000) + body.expires_in)
  }

  logout () {
    this.config.accessToken = ''
    this.config.refreshToken = ''
    this.config.accessTokenExpiration = 0
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, '')
    localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, '')
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_EXPIRATION_KEY, '')
  }

  getAuthHeaders () {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.accessToken}`
    }
  }

  async tryAuthentication () {
    if (this.config.accessToken) {
      // validate the access token
      try {
        await this.getUserProfile()

        // set a timer to refresh the access token 10 minutes before expiration
        const remainingValidity = Math.floor(Date.now() / 1000) - this.config.accessTokenExpiration
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

  isLoggedIn () {
    return !!this.config.accessToken
  }

  async refreshAccessToken () {
    const searchParams = Object.entries({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: this.config.refreshToken
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

    this.config.accessToken = result.access_token
    this.config.accessTokenExpiration = Math.floor(Date.now() / 1000) + result.expires_in
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, this.config.accessToken)
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_EXPIRATION_KEY, this.config.accessTokenExpiration)

    // refresh the access token 10 minutes before expiration
    setTimeout(async () => {
      await this.refreshAccessToken()
    }, (result.expires_in - 600) * 1000)
  }

  async getUserProfile () {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: this.getAuthHeaders(),
      method: 'GET'
    })
    this.ensureValidResponse(res)
  }

  async getPlaylist (playlistID: string) {
    return this.fetchAllItems(`https://api.spotify.com/v1/playlists/${playlistID}`, 'tracks', 100)
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
    const body = await this.fetchAllItems(`https://api.spotify.com/v1/me/playlists`, 'items', 50)
    return body.items.map((playlist: any) => {
      return {
        id: playlist.id,
        name: playlist.name,
        image: playlist.images[0].url
      }
    })
  }

  async getAvailableDevices () {
    const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: this.getAuthHeaders()
    })
    this.ensureValidResponse(res)
    return (await res.json()).devices
  }

  async transferPlayback (deviceId: string) {
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

  async play (trackID: string, startPosition = 0) {
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

  async pause () {
    const res = await fetch('https://api.spotify.com/v1/me/player/pause', {
      headers: this.getAuthHeaders(),
      method: 'PUT'
    })
    this.ensureValidResponse(res)
  }

  async fetchAllItems (url: string, collectionKey: string, limit: number): Promise<any> {
    if (url.indexOf('?') === -1) {
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

  // private
  ensureValidResponse (response: Response) {
    if (!/^2/.test(response.status.toFixed())) {
      throw new Error(`Invalid response: ${response.statusText}`)
    }
  }
}
