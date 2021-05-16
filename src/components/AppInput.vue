<template>
  <input :type="type" :class="classes" :value="modelValue" @input="">
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppInput',
  props: {
    type: {
      type: String,
      default: 'text'
    },
    modelValue: { // eslint-disable-line vue/require-prop-types
      default: undefined
    }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      loading: false
    }
  },
  computed: {
    classes () {
      const classes: string[] = ['input']
      return classes
    }
  },
  methods: {
    triggerClick (event: Event): void {
      this.$emit('update:modelValue', (event.target as HTMLInputElement)!.value)
    }
  }
})
</script>

<style lang="sass" scoped>
.input
  line-height: 2em
  height: 1em
  padding: 8px
  padding-right: 0
  border-style: solid

  &:invalid
    outline-color: red
    border-color: red
    color: red

  &:hover
    background-color: #e7e7e755
</style>
