<template>
  <div class="wrapper">
    <img :src="logoUrl" alt="SpotiBlind"/>
    <app-button class="login-btn" @click="$spotifyClient.redirectToSpotifyLogin()">
      <icon-mdi-spotify class="mr-2"/>
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
    // if (this.$spotifyClient.isLoggedIn()) {
    //   this.$router.push('/')
    // }
  }
})
</script>

<style lang="sass" scoped>
.wrapper
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  height: 100vh

.login-btn
  margin-top: 2em
  font-size: 2em

.mr-2
  margin-right: 8px
</style>
