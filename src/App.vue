<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>

<style lang="sass">
html
  box-sizing: border-box
  word-break: pre-line

*,
*:before,
*:after
  box-sizing: inherit

body
  margin: 0

#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50
  height: 100vh
  display: flex
  flex-direction: column

.u-spacer
  flex-grow: 1

</style>
