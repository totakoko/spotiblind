<template>
  <div>
    <v-btn
      class="logout-btn"
      @click="logout()"
    >
      Logout
    </v-btn>
    <div
      v-if="noDevicesFound"
      class="no-devices-found-banner"
    >
      No Spotify devices found!
    </div>
    <router-view />
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
.logout-btn
  position: absolute !important
  top: 2vh
  right: 1vw

.no-devices-found-banner
  background-color: #ff3f3f
  position: absolute
  top: 0
  left: 0
  right: 0
  text-align: center
  color: white
  padding: .5em 0
</style>
