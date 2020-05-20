<template>
  <v-btn @click="$spotifyClient.redirectToSpotifyLogin()">
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
