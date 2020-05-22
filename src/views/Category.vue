<template>
  <div v-if="loaded">
    <v-breadcrumbs :items="breadcrumbs" />
    <div class="library">
      <v-btn
        v-for="playlist in playlists"
        :key="playlist.id"
        class="library__category-btn"
        :style="{backgroundImage: `url(${playlist.image})`}"
        :to="`/categories/${categoryId}/playlists/${playlist.id}`"
      >
        {{ playlist.name }}
      </v-btn>
    </div>
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
    loaded: false,
    category: null,
    playlists: []
  }),
  computed: {
    breadcrumbs () {
      return [
        {
          text: 'Categories',
          to: '/'
        },
        {
          text: this.category.name,
          to: `/categories/${this.categoryId}`
        }
      ]
    }
  },
  async created () {
    const [category, playlists] = await Promise.all([
      this.$spotifyClient.getCategory(this.categoryId),
      this.$spotifyClient.getCategoryPlaylists(this.categoryId)
    ])
    this.category = category
    this.playlists = playlists
    this.loaded = true
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
