<template>
  <router-view />
  <app-pwa-reload />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50
  height: 100vh
  display: flex
  flex-direction: column
  background-color: #f5f5f5

.u-spacer
  flex-grow: 1

</style>
