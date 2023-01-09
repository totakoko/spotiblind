<template>
  <!-- one root node for transitions -->
  <div v-if="loaded" class="d-flex-column">
    <h2>Categories</h2>
    <div class="library">
      <app-button v-for="category in categories" :key="category.id" dark class="library__item" :style="{backgroundImage: `url(${category.image})`}" :to="`/categories/${category.id}`">
        {{ category.name }}
      </app-button>
    </div>

    <h2>Playlists</h2>
    <div class="library">
      <app-button v-for="playlist in playlists" :key="playlist.id" dark class="library__item" :class="{'library__item--empty': !playlist.image}" :style="{backgroundImage: playlist.image ? `url(${playlist.image})` : ''}" :to="`/playlists/${playlist.id}`">
        {{ playlist.name }}
        <icon-mdi-music-note v-if="!playlist.image" style="margin: 1em" />
      </app-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Category } from '../services/spotify/types'

export default defineComponent({
  data: () => ({
    loaded: false,
    categories: [] as Category[],
    playlists: [] as Category[]
  }),
  async created () {
    await Promise.all([
      (async () => {
        this.categories = await this.$spotifyClient.getCategories()
        this.categories.forEach(category => {
          if (category.name.includes('/')) {
            category.name = category.name.replace(/\//, ' / ')
          }
        })
      })(),
      (async () => {
        this.playlists = await this.$spotifyClient.getUserPlaylists()
        this.playlists.forEach(category => {
          if (category.name.includes('/')) {
            category.name = category.name.replace(/\//, ' / ')
          }
        })
      })()
    ])
    this.loaded = true
  }
})
</script>

<style lang="sass" scoped>
@use '../common'

.library__item
  font-size: 1.2em !important
  font-weight: 400 !important
  flex-direction: column-reverse
  text-shadow: 0 0 8px #000000
  justify-content: end

  &--empty
    background-color: #282828
</style>
