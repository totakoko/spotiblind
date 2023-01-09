import { expect, it } from 'vitest'
import { normalize } from './util'

it('#normalize()', () => {
  expect(normalize('don\'t')).toBe('don\'t')
  expect(normalize('hello')).toBe('hello')
  expect(normalize('élo')).toBe('elo')
  expect(normalize(null)).toBe('')
  expect(normalize(undefined)).toBe('')
})
