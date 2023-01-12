<template>
  <!-- one root node for transitions -->
  <div v-if="state.loaded" class="d-flex-column">
    <h2>Categories</h2>
    <div class="library">
      <app-button v-for="category in state.categories" :key="category.id" dark class="library__item" :style="{backgroundImage: `url(${category.image})`}" :to="`/categories/${category.id}`">
        {{ category.name }}
      </app-button>
    </div>

    <h2>Playlists</h2>
    <div class="library">
      <app-button v-for="playlist in state.playlists" :key="playlist.id" dark class="library__item" :class="{'library__item--empty': !playlist.image}" :style="{backgroundImage: playlist.image ? `url(${playlist.image})` : ''}" :to="`/playlists/${playlist.id}`">
        {{ playlist.name }}
        <icon-mdi-music-note v-if="!playlist.image" style="margin: 1em" />
      </app-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, reactive } from 'vue'
import { SPOTIFY_CLIENT } from '../injects'
import { Category, Playlist } from '../services/spotify/types'

const spotifyClient = inject(SPOTIFY_CLIENT)!

interface State {
  loaded: boolean
  categories: Category[]
  playlists: Playlist[]
}

const state = reactive<State>({
  loaded: false,
  categories: [],
  playlists: []
})

await Promise.all([
  (async () => {
    state.categories = await spotifyClient.getCategories()
    state.categories.forEach(category => {
      if (category.name.includes('/')) {
        category.name = category.name.replace(/\//, ' / ')
      }
    })
  })(),
  (async () => {
    state.playlists = await spotifyClient.getUserPlaylists()
    state.playlists.forEach(category => {
      if (category.name.includes('/')) {
        category.name = category.name.replace(/\//, ' / ')
      }
    })
  })()
])
state.loaded = true
</script>

<style lang="sass" scoped>
@use '../styles/library'

.library__item
  font-size: 1.2em !important
  font-weight: 400 !important
  flex-direction: column-reverse
  text-shadow: 0 0 8px #000000
  justify-content: end

  &--empty
    background-color: #282828
</style>
