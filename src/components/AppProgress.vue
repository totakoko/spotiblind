<template>
  <progress max="100" :value="progress" />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, watchEffect } from 'vue'

const props = defineProps<{
  duration: number
}>()

let frameScheduler = -1
const progress = ref(0)

watchEffect(() => {
  cancelAnimationFrame(frameScheduler)
  if (props.duration > 0) {
    frameScheduler = requestAnimationFrame(createStep(Date.now()))
  } else {
    progress.value = 0
  }
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frameScheduler)
})

function createStep (startTime: number) {
  return function step () {
    progress.value = (Date.now() - startTime) * 100 / props.duration
    if (progress.value < 100) {
      frameScheduler = requestAnimationFrame(step.bind(null, startTime))
    }
  }
}
</script>
