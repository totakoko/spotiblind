<script lang="ts" setup>
export interface ProgressConfig {
  duration: number
  shakeAnimation?: boolean
}
const props = defineProps<{
  config: ProgressConfig
}>()

const progressValue = ref(100)
const progressClasses = ref('')

// this variable is used in CSS
const progressColor = ref(`hsl(100deg 50% 50%)`)
const progressDropShadow = ref(`0rem`)

let frameSchedulerTimeout = -1

watchEffect(() => {
  cancelAnimationFrame(frameSchedulerTimeout)
  if (props.config.duration > 0) {
    frameSchedulerTimeout = requestAnimationFrame(createStep(Date.now()))
  } else {
    progressValue.value = 100
  }
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frameSchedulerTimeout)
})

function createStep(startTime: number) {
  return function step() {
    const ratio = (Date.now() - startTime) / props.config.duration
    progressValue.value = 100 - ratio * 100 // the progress is reversed so that we can see the remaining time

    const hueProgressRatio = Math.max(1 + Math.log2(ratio), 0) // slower progression, stays longer in the green (half of the time)
    const startingHueAngle = 100
    const endingHueAngle = 0
    const hueAngle = startingHueAngle - hueProgressRatio * (startingHueAngle - endingHueAngle)
    progressColor.value = `hsl(${hueAngle}deg ${50 + hueProgressRatio * 50}% 50%)` //

    if (props.config.shakeAnimation) {
      progressClasses.value = ratio >= 0.9 ? 'big-horizontal-shaking' : ratio >= 0.7 ? 'small-horizontal-shaking' : ''
      progressDropShadow.value = `${(ratio - 0.6) * 3}rem` // start at .6s from 0 to 1.2rem
    }
    if (progressValue.value > 0) {
      frameSchedulerTimeout = requestAnimationFrame(createStep(startTime))
    } else {
      progressClasses.value = ''
    }
  }
}
</script>

<template>
  <div rotate-180>
    <progress :class="progressClasses" w-full max="100" :value="progressValue" />
  </div>
</template>

<style lang="sass" scoped>
@mixin horizontal-shaking($width)
  0%
    transform: translateX(0)
  25%
    transform: translateX($width)
  50%
    transform: translateX(-$width)
  75%
    transform: translateX($width)
  100%
    transform: translateX(0)

// regrouping these two rules does not seem to work for Chrome... ¯\_(ツ)_/¯
progress::-webkit-progress-value // chrome
  background-color: v-bind(progressColor)
  filter: drop-shadow(0 0 v-bind(progressDropShadow) v-bind(progressColor))

progress[value]::-moz-progress-bar // firefox
  background-color: v-bind(progressColor)
  filter: drop-shadow(0 0 v-bind(progressDropShadow) v-bind(progressColor))

progress::-webkit-progress-bar, // chrome
progress // firefox
  background-color: #ddd

.small-horizontal-shaking
  animation: .25s linear infinite small-horizontal-shaking

.big-horizontal-shaking
  animation: .25s linear infinite big-horizontal-shaking

@keyframes small-horizontal-shaking
  @include horizontal-shaking(2px)

@keyframes big-horizontal-shaking
  @include horizontal-shaking(6px)
</style>
