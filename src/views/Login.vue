<template>
  <v-btn
    class="login-btn"
    @click="$spotifyClient.redirectToSpotifyLogin()"
  >
    <v-icon
      color="#84BD00"
      left
    >
      mdi-spotify
    </v-icon>
    Login via Spotify
  </v-btn>
</template>

<script>
export default {
  async created () {
    if (this.$spotifyClient.isLoggedIn()) {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="sass">
.login-btn
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  max-width: 300px
</style>
