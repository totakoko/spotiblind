<template>
  <div class="library">
    <v-btn
      class="blindtest__back-to-playlists-btn"
      to="/"
    >
      Categories
    </v-btn>
    <v-btn
      v-for="playlist in playlists"
      :key="playlist.id"
      class="library__category-btn"
      :style="{backgroundImage: `url(${playlist.image})`}"
      :to="`/playlists/${playlist.id}`"
    >
      {{ playlist.name }}
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    categoryId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    playlists: []
  }),
  async created () {
    this.playlists = await this.$spotifyClient.getCategoryPlaylists(this.categoryId)
  }
}
</script>

<style lang="sass">
$playlist-btn-width: 200px

.library
  display: flex
  justify-content: space-evenly
  flex-wrap: wrap
  width: 100%

  &__category-btn
    height: $playlist-btn-width !important
    width: $playlist-btn-width !important
    font-size: 1.2em !important
    font-weight: 400 !important
    margin: 1rem
    background-size: cover
    color: white !important
    text-transform: initial !important

    .v-btn__content
      position: absolute
      bottom: 2em

</style>
