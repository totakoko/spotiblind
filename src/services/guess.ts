import { distance } from 'fastest-levenshtein'
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

export class TrackGuesser {
  private readonly name: string
  private readonly artists: string[]

  // TODO mettre une ref publique pour contenir le statut

  constructor (track: Track) {
    this.name = normalize(track.name).replace(/ \(feat\. .*\)/, '')
    this.artists = track.artists.map(artist => normalize(artist))
  }

  guess (trackOrArtist: string): GuessResult[] {
    const results: GuessResult[] = []
    const distanceThreshold = getDistanceThreshold(trackOrArtist)
    if (distance(trackOrArtist, this.name) <= distanceThreshold) {
      results.push({
        type: 'name'
      })
    }

    for (const [index, artist] of this.artists.entries()) {
      if (distance(trackOrArtist, artist) <= distanceThreshold) {
        results.push({
          type: 'artist',
          index
        })
      }
    }
    return results
  }
}

// allow 1 error every 10 characters
function getDistanceThreshold (guess: string): number {
  return Math.floor(guess.length / 10)
}
