<template>
  <div class="navbar">
    <app-button dark tile class="navbar__brand" to="/">
      SpotiBlind
    </app-button>

    <div class="u-spacer" />

    <app-button dark tile title="Settings" to="/settings">
      <icon-mdi-cog class="navbar__icon" />
    </app-button>
    <app-button dark tile title="Log out" @click="logout()">
      <icon-mdi-logout class="navbar__icon" />
    </app-button>
  </div>

  <div class="content">
    <router-view />
  </div>

  <div v-if="missingDevice" class="no-devices-found-banner">
    No Spotify devices found!
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  computed: {
    missingDevice () {
      return this.$spotifyClient.devices.value.length === 0
    }
  },
  async created () {
    if (!this.$spotifyClient.isLoggedIn()) {
      await this.$router.push('/login')
      return
    }
    this.$spotifyClient.start()
  },
  unmounted () {
    this.$spotifyClient.stop()
  },
  methods: {
    async logout () {
      this.$spotifyClient.logout()
      await this.$router.push('/login')
    }
  }
})
</script>

<style lang="sass">
.navbar
  display: flex
  background-color: #7c4dff
  box-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%), 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%)
  height: 48px

  &__brand
    font-size: 1.5em

  &__icon
    font-size: 2em

.content
  flex: 1
  overflow: auto
  padding: .5em

.no-devices-found-banner
  background-color: #ff3f3f
  text-align: center
  color: white
  padding: .5em 0

</style>
