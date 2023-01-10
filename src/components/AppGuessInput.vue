<template>
  <div class="pa-3">
    <div>
      <input v-model="guess" type="text" placeholder="artist / track name" class="input" :class="{ 'input--error': submitError }" @keydown.enter="emitGuess()">
      <app-button :disabled="guess.length === 0 || track === null" @click="emitGuess()">
        OK
      </app-button>
    </div>
    <div class="mt-2">
      <div>
        Track: {{ trackGuesser.state.track && track !== null ? track.name : '?' }}
      </div>
      <div>
        Artist: {{ trackGuesser.state.artist && track !== null ? track.artists[0] : '?' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { TrackGuesser } from '../services/guess'
import { Track } from '../services/spotify/types'

const props = defineProps<{
  track: Track | null
}>()

let trackGuesser: TrackGuesser

watchEffect(() => {
  if (props.track) {
    trackGuesser = new TrackGuesser(props.track)
  }
})

const submitError = ref(false)
const guess = ref('')

function emitGuess () {
  if (props.track === null) {
    return
  }
  const results = trackGuesser!.guess(guess.value)
  if (results.length === 0) {
    submitError.value = true
    window.setTimeout(() => {
      submitError.value = false
    }, 600)
  }
  guess.value = ''
}

</script>

<style lang="sass" scoped>
.input
  padding: 8px
  border-style: solid
  transition: background-color .3s

  &:invalid
    outline-color: red
    border-color: red
    color: red

  &:focus,
  &:hover,
  &:focus-visible
    background-color: #d7d7d755

  &--error
    animation-name: shakeError
    animation-fill-mode: forwards
    animation-duration: .6s
    animation-timing-function: ease-in-out
    border-color: red !important
    outline-color: red !important
    color: red !important

@keyframes shake-error
  0%
    transform: translateX(0)
  15%
    transform: translateX(0.375rem)
  30%
    transform: translateX(-0.375rem)
  45%
    transform: translateX(0.375rem)
  60%
    transform: translateX(-0.375rem)
  75%
    transform: translateX(0.375rem)
  90%
    transform: translateX(-0.375rem)
  100%
    transform: translateX(0)

.pa-3
  padding: 16px

.mt-2
  margin-top: 8px
</style>
