<template>
  <h2>Categories</h2>
  <div class="library">
    <app-button v-for="category in categories" :key="category.id" dark class="library__item" :style="{backgroundImage: `url(${category.image})`}" :to="`/categories/${category.id}`">
      {{ category.name }}
    </app-button>
  </div>

  <h2>Playlists</h2>
  <div class="library">
    <app-button v-for="playlist in playlists" :key="playlist.id" dark class="library__item" :style="{backgroundImage: `url(${playlist.image})`}" :to="`/playlists/${playlist.id}`">
      {{ playlist.name }}
    </app-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Category } from '../services/spotify'

export default defineComponent({
  name: 'Library',
  data: () => ({
    categories: [] as Category[],
    playlists: [] as Category[]
  }),
  async created () {
    this.categories = await this.$spotifyClient.getCategories()
    this.categories.forEach(category => {
      if (category.name.includes('/')) {
        category.name = category.name.replace(/\//, ' / ')
      }
    })
    this.playlists = await this.$spotifyClient.getUserPlaylists()
    this.playlists.forEach(category => {
      if (category.name.includes('/')) {
        category.name = category.name.replace(/\//, ' / ')
      }
    })
  }
})
</script>

<style lang="sass" scoped>
@use '../common'

.library__item
  font-size: 1.2em !important
  font-weight: 400 !important
  flex-direction: column-reverse

</style>
