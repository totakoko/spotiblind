<template>
  <div v-if="loaded">
    <v-breadcrumbs :items="breadcrumbs" />
    <div class="library">
      <v-btn
        v-for="playlist in playlists"
        :key="playlist.id"
        class="library__item"
        :style="{backgroundImage: `url(${playlist.image})`}"
        :to="`/categories/${categoryId}/playlists/${playlist.id}`"
      />
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

<style lang="sass" scoped>
@use '../styles/library'

</style>
