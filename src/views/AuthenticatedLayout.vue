<script lang="ts" setup>
import spotiblindLogoUrl from '@/assets/spotiblind-logo.svg'
import { SPOTIFY_CLIENT } from '@/injects'

const router = useRouter()
const spotifyClient = inject(SPOTIFY_CLIENT)!

spotifyClient.start()

onUnmounted(() => {
  spotifyClient.stop()
})

async function logout() {
  spotifyClient.logout()
  await router.push('/login')
}
const deviceReady = spotifyClient.deviceReady
</script>

<template>
  <div class="navbar" h-3rem flex>
    <AppButton tile text-2xl c-white to="/">
      <img :src="spotiblindLogoUrl" width="40" height="40" alt="Logo" style="margin-right: 8px">
      SpotiBlind
    </AppButton>
    <div flex-1 />

    <AppButton tile c-white title="About" to="/about">
      <div i-mdi-help text-size-1.8rem />
    </AppButton>
    <AppButton tile c-white title="Settings" to="/settings">
      <div i-mdi-cog text-size-2rem />
    </AppButton>
    <AppButton tile c-white title="Log out" @click="logout()">
      <div i-mdi-logout text-size-2rem />
    </AppButton>
  </div>

  <div flex-1 overflow-auto p-.5em>
    <router-view />
  </div>

  <div v-if="!deviceReady" bg-red-500 py-.5em text-center c-white>
    No Spotify devices found!
  </div>
</template>

<style lang="sass">
.navbar
  background-color: #7c4dff
  box-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%)
</style>
