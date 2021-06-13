<template>
  <div class="library">
    <app-button v-for="playlist in playlists" :key="playlist.id" dark class="library__item" :style="{backgroundImage: `url(${playlist.image})`}" :to="`/categories/${categoryId}/playlists/${playlist.id}`" :title="playlist.name" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Category, Playlist } from '../services/spotify'

interface Data {
  loaded: boolean
  category: Category | null
  playlists: Playlist[]
}

export default defineComponent({
  name: 'Category',
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
  } as Data),
  computed: {
    breadcrumbs (): any[] {
      return [
        {
          text: 'Categories',
          to: '/'
        },
        {
          text: this.category?.name,
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
})
</script>

<style lang="sass" scoped>
@use '../common'

</style>
