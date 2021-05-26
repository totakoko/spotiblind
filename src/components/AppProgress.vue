<template>
  <progress max="100" :value="progress" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppProgress',
  props: {
    duration: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      frameScheduler: -1,
      progress: 0
    }
  },
  watch: {
    duration: {
      handler (value) {
        cancelAnimationFrame(this.frameScheduler)
        if (value > 0) {
          this.frameScheduler = requestAnimationFrame(this.step.bind(this, Date.now()))
        } else {
          this.progress = 0
        }
      },
      immediate: true
    }
  },
  beforeUnmount () {
    cancelAnimationFrame(this.frameScheduler)
  },
  methods: {
    step (startTime: number) {
      this.progress = (Date.now() - startTime) * 100 / this.duration
      if (this.progress < 100) {
        this.frameScheduler = requestAnimationFrame(this.step.bind(this, startTime))
      }
    }
  }
})
</script>
