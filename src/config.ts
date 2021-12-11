import { SpotifyClientConfig } from './services/spotify/client'

export const config: SpotifyClientConfig = {
  clientId: '4d4450d11db8449097d50daa39321192',

  redirectURI: `${location.origin}/login`
}
