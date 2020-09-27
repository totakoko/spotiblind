<template>
  <div style="width: 100%">
    <v-app-bar
      color="deep-purple accent-2"
      dense
      dark
    >
      <v-btn
        class="full-height"
        tile
        text
        @click="$router.push('/')"
      >
        Spotiblind
      </v-btn>

      <v-spacer />

      <v-btn
        class="full-height"
        tile
        text
        title="Settings"
        @click="$router.push('/settings')"
      >
        <v-icon>mdi-settings</v-icon>
      </v-btn>
      <v-btn
        class="full-height"
        tile
        text
        title="Log out"
        @click="logout()"
      >
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <router-view />

    <div
      v-if="noDevicesFound"
      class="no-devices-found-banner"
    >
      No Spotify devices found!
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      noDevicesFound: false,
      devicesCheckTimeout: null
    }
  },
  async created () {
    if (!this.$spotifyClient.isLoggedIn()) {
      await this.$router.push('/login')
    }
    this.devicesCheckTimeout = setInterval(async () => {
      this.noDevicesFound = (await this.$spotifyClient.getAvailableDevices()).length === 0
    }, 5000)
  },
  destroyed () {
    clearInterval(this.devicesCheckTimeout)
  },
  methods: {
    logout () {
      this.$spotifyClient.logout()
      // TODO Refresh state
      window.location = '/'
    }
  }
}
</script>

<style lang="sass">
.no-devices-found-banner
  background-color: #ff3f3f
  position: fixed
  bottom: 0
  left: 0
  right: 0
  text-align: center
  color: white
  padding: .5em 0

.full-height
  height: 100%
</style>
