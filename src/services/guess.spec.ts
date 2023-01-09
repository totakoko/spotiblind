import { describe, expect, it } from 'vitest'
import { TrackGuesser } from './guess'
import { Track } from './spotify/types'

const commonOptions = {
  duration: 999,
  id: '1'
}

const track1: Track = {
  artists: ['David Guetta'],
  name: 'Love Don\'t Let Me Go',
  ...commonOptions
}
const track2: Track = {
  artists: ['David Guetta', 'Kid Kudi'],
  name: 'Memories (feat. Kid Cudi)',
  ...commonOptions
}
const track3: Track = {
  artists: ['Rammstein'],
  name: 'Rammstein',
  ...commonOptions
}

describe('TrackGuesser#guess()', () => {
  it('remove the feats from the track name', () => {
    expect(new TrackGuesser(track2).guess('memories')).toEqual([
      {
        type: 'name'
      }
    ])
    expect(new TrackGuesser(track2).guess('memories')).toEqual([
      {
        type: 'name'
      }
    ])
  })

  it('guess exactly the track name and artists', () => {
    const guesser = new TrackGuesser(track2)
    expect(guesser.guess('memories')).toEqual([
      {
        type: 'name'
      }
    ])
    expect(guesser.guess('david guetta')).toEqual([
      {
        type: 'artist',
        index: 0
      }
    ])
    expect(guesser.guess('kid kudi')).toEqual([
      {
        type: 'artist',
        index: 1
      }
    ])
  })

  it('guess with 1 error', () => {
    expect(new TrackGuesser(track1).guess('love dont let me go')).toEqual([
      {
        type: 'name'
      }
    ])
    expect(new TrackGuesser(track2).guess('david gretta')).toEqual([
      {
        type: 'artist',
        index: 0
      }
    ])
  })

  it('guess artist and track name at the same time', () => {
    expect(new TrackGuesser(track3).guess('rammstein')).toEqual([
      {
        type: 'name'
      },
      {
        type: 'artist',
        index: 0
      }
    ])
  })

  it('fail to guess', () => {
    const guesser = new TrackGuesser(track2)
    expect(guesser.guess('my memories')).toEqual([])
    expect(guesser.guess('david bowie')).toEqual([])
    expect(guesser.guess('kid cady')).toEqual([])
  })
})
