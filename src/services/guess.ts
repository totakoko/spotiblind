import { distance } from 'fastest-levenshtein'
import { reactive } from 'vue'
import { normalize } from '../util/util'
import { Track } from './spotify/types'

export type GuessResult = NameGuessResult | ArtistGuessResult

export interface NameGuessResult {
  type: 'name'
}

export interface ArtistGuessResult {
  type: 'artist'
  index: number
}

export interface TrackGuesserState {
  artist: boolean
  track: boolean
}

export class TrackGuesser {
  private readonly name: string
  private readonly artists: string[]

  public state = reactive<TrackGuesserState>({
    artist: false,
    track: false
  })

  constructor (track: Track) {
    this.name = normalize(cleanTrackName(track.name))
    this.artists = track.artists.map(artist => normalize(artist))
  }

  guess (trackOrArtist: string): GuessResult[] {
    const results: GuessResult[] = []
    const distanceThreshold = getDistanceThreshold(trackOrArtist)
    if (distance(trackOrArtist, this.name) <= distanceThreshold) {
      this.state.track = true
      results.push({
        type: 'name'
      })
    }

    // only guess the first artist for now
    if (distance(trackOrArtist, this.artists[0]) <= distanceThreshold) {
      this.state.artist = true
      results.push({
        type: 'artist',
        index: 0
      })
    }
    // for (const [index, artist] of this.artists.entries()) {
    //   if (distance(trackOrArtist, artist) <= distanceThreshold) {
    //     this.state.artist = true
    //     results.push({
    //       type: 'artist',
    //       index
    //     })
    //   }
    // }
    return results
  }
}

// allow 1 error every 10 characters
function getDistanceThreshold (guess: string): number {
  return Math.floor(guess.length / 10)
}

// remove junk from the track name (featurings, radio edit...)
export function cleanTrackName (trackName: string): string {
  return trackName
    .replace(/ \(feat\. .*\).*$/i, '')
    .replace(/ - Radio (edit|version).*$/i, '')
    .replace(/ - Remastered.*$/i, '')
    .replace(/ - Compilation.*$/i, '')
}
