<script lang="ts" setup>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { TrackGuesser } from '@/services/guess'
import type { Track } from '@/services/spotify/types'

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
const submitSuccess = ref(false)

const inputClasses = computed(() => ({
  'input--error': submitError.value,
  'input--success': submitSuccess.value,
}))

const inputElement = ref<HTMLElement | null>(null)
onMounted(() => {
  inputElement.value?.focus()
})

const guess = ref('')
function emitGuess() {
  inputElement.value?.focus()
  if (props.track === null) {
    return
  }

  const results = trackGuesser!.guess(guess.value)

  const feedbackStyleRef = results.length > 0 ? submitSuccess : submitError
  feedbackStyleRef.value = true
  window.setTimeout(() => {
    feedbackStyleRef.value = false
  }, 600)
  guess.value = ''
}
</script>

<template>
  <div pa-4>
    <div flex>
      <input
        ref="inputElement"
        v-model="guess" border-2 border-gray rounded px-2 transition-300 invalid:border-red hover:bg-gray-200 invalid:c-red invalid:outline-red
        type="text" autocomplete="off" placeholder="artist / track name"
        :class="inputClasses" @keydown.enter="emitGuess()"
      >
      <AppButton :disabled="guess.length === 0 || track === null" @click="emitGuess()">
        OK
      </AppButton>
    </div>
    <div mt-2>
      <div>
        Track: {{ trackGuesser.state.track && track !== null ? track.name : '?' }}
      </div>
      <div>
        Artist: {{ trackGuesser.state.artist && track !== null ? track.artists[0] : '?' }}
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
$successBackgroundColor : #19d11b82
$successBorderColor : darken($successBackgroundColor, 40%)

.input
  &--error
    animation-name: shake-error
    animation-fill-mode: forwards
    animation-duration: .6s
    animation-timing-function: ease-in-out
    border-color: red !important
    outline-color: red !important
    background-color: lighten(red, 40%) !important
    color: red !important

  &--success
    border-color: $successBorderColor !important
    outline-color: $successBorderColor !important
    background-color: $successBackgroundColor !important
    color: $successBorderColor !important

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
</style>
