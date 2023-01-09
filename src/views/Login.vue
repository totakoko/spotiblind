<template>
  <div class="wrapper">
    <div class="header">
      <img class="logo" :src="logoUrl" alt="Spotiblind">
      <h1 class="title">
        SpotiBlind
      </h1>
    </div>
    <app-button class="login-btn" @click="spotifyClient.redirectToSpotifyLogin()">
      <icon-mdi-spotify class="mr-2" />
      Login via Spotify
    </app-button>
  </div>
</template>

<script lang="ts" setup>
import { inject, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../assets/spotiblind-logo.svg'
import { SPOTIFY_CLIENT } from '../injects'

const spotifyClient = inject(SPOTIFY_CLIENT)!

const router = useRouter()

onBeforeMount(async () => {
  if (spotifyClient.isLoggedIn()) {
    await router.push('/')
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

.header
  grid-row: 2
  text-align: center

.logo
  width: 300px

.title
  margin-top: -1em

.login-btn
  margin-top: 2em
  font-size: 2em
  grid-row: 3

.mr-2
  margin-right: .5rem
</style>
