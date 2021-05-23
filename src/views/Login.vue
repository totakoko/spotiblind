<template>
  <div class="wrapper">
    <img class="logo" :src="logoUrl" alt="SpotiBlind">
    <app-button class="login-btn" @click="$spotifyClient.redirectToSpotifyLogin()">
      <icon-mdi-spotify class="mr-2" />
      Login via Spotify
    </app-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import logoUrl from '../assets/logo.png'

export default defineComponent({
  data () {
    return {
      logoUrl
    }
  },
  async beforeCreate () {
    if (this.$spotifyClient.isLoggedIn()) {
      await this.$router.push('/')
    }
  }
})
</script>

<style lang="sass" scoped>
.wrapper
  height: 100%
  display: grid
  grid-template-rows: 1fr auto auto 2fr
  justify-items: center
  padding: 2em

.logo
  max-width: 100%
  grid-row: 2

.login-btn
  margin-top: 2em
  font-size: 2em
  grid-row: 3

.mr-2
  margin-right: .5rem
</style>
