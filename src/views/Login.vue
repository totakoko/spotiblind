<script lang="ts" setup>
import { inject } from 'vue'
import { SPOTIFY_CLIENT } from '@/injects'
import logoUrl from '@/assets/spotiblind-logo.svg'

const spotifyClient = inject(SPOTIFY_CLIENT)!
</script>

<template>
  <div grid h-full place-items-center>
    <div>
      <img :src="logoUrl" alt="" w-300px>
      <h1 text-center text-4xl font-bold line-height-1.5em>
        SpotiBlind
      </h1>
      <AppButton mt-4rem text-3xl @click="spotifyClient.redirectToSpotifyLogin()">
        <div i-mdi-spotify mr-2 />
        Login via Spotify
      </AppButton>
    </div>
  </div>
</template>
