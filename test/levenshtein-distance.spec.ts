import { distance } from 'fastest-levenshtein'
import { describe, expect, it } from 'vitest'

describe('levenshtein distance', () => {
  it('uppercase', () => {
    expect(distance('abcd', 'abc')).toEqual(1)
    expect(distance('abd', 'abc')).toEqual(1)
    expect(distance('abC', 'abc')).toEqual(1)
  })
})
