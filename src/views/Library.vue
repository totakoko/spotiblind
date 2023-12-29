<script lang="ts" setup>
import { SPOTIFY_CLIENT } from '@/injects'
import type { Category, Playlist } from '@/services/spotify/types'

const spotifyClient = inject(SPOTIFY_CLIENT)!

interface State {
  loaded: boolean
  categories: Category[]
  playlists: Playlist[]
}

const state = reactive<State>({
  loaded: false,
  categories: [],
  playlists: [],
})

await Promise.all([
  (async () => {
    state.categories = await spotifyClient.getCategories()
  })(),
  (async () => {
    state.playlists = await spotifyClient.getUserPlaylists()
  })(),
])
state.loaded = true
</script>

<template>
  <!-- one root node for transitions -->
  <div v-if="state.loaded" class="d-flex-column">
    <h2 text-2xl font-bold line-height-1.5em>
      Categories
    </h2>
    <div class="library">
      <AppButton v-for="category in state.categories" :key="category.id" c-white class="library__item" :style="{ backgroundImage: `url(${category.image})` }" :to="`/categories/${category.id}`">
        {{ category.name }}
      </AppButton>
    </div>

    <h2 text-2xl font-bold line-height-1.5em>
      Playlists
    </h2>
    <div class="library">
      <AppButton v-for="playlist in state.playlists" :key="playlist.id" c-white class="library__item" :class="{ 'library__item--empty': !playlist.image }" :style="{ backgroundImage: playlist.image ? `url(${playlist.image})` : '' }" :to="`/playlists/${playlist.id}`">
        <div v-if="!playlist.image" i-mdi-music-note />
        {{ playlist.name }}
      </AppButton>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use '../styles/library'

.library__item
  font-size: 1.2em !important
  font-weight: 400 !important
  flex-direction: column
  text-shadow: 0 0 8px #000000
  justify-content: end

  &--empty
    background-color: #282828
</style>
