
export interface PKCE {
  codeVerifier: string
  csrfToken: string
}

export interface State {
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
  authors: string[]
  duration: number
}

export interface Device {
  id: string
  is_active: boolean
  is_private_session: boolean
  is_restricted: boolean
  name: string
  type: string
  volume_percent: number
}
