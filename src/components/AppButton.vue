<template>
  <button :class="classes" :disabled="disable || loading" @click="handleClick">
    <slot />
    <div class="button__overlay" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    tag: {
      type: String,
      default: 'button'
    },
    tile: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: false
    },
    to: {
      type: String,
      default: ''
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  data () {
    return {
      loading: false
    }
  },
  computed: {
    classes () {
      const classes: string[] = ['button']
      if (this.dark) {
        classes.push('button--dark')
      }
      if (this.tile) {
        classes.push('button--tile')
      }
      return classes
    }
  },
  methods: {
    async handleClick () {
      if (this.to) {
        this.loading = true
        try {
          await this.$router.push(this.to)
        } finally {
          this.loading = false
        }
      } else {
        this.$emit('click')
      }
    }
  }
})
</script>

<style lang="sass" scoped>
.button
  display: inline-flex
  justify-content: center
  align-items: center
  padding: 8px
  border: none
  background-color: transparent
  font-weight: bold
  transition: .3s
  min-width: 48px
  position: relative
  // height: 100%
  cursor: pointer

  // border: 1px solid black
  // &:hover
  //   background-color: #e7e7e7

  &[disabled]
    cursor: not-allowed

  &:not(.button--tile,[disabled])
    box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%)

  &--dark
    color: white

  &__overlay
    position: absolute
    top: 0
    left: 0
    bottom: 0
    right: 0
    transition: all .3s

    &:hover
      background-color: #e7e7e755

</style>
