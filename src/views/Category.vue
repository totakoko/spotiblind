<template>
  <div v-if="state.loaded" class="library">
    <app-button v-for="playlist in state.playlists" :key="playlist.id" dark class="library__item" :style="{backgroundImage: `url(${playlist.image})`}" :to="`/categories/${categoryId}/playlists/${playlist.id}`" :title="playlist.name" />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, reactive } from 'vue'
import { SPOTIFY_CLIENT } from '../injects'
import { Category, Playlist } from '../services/spotify/types'

const spotifyClient = inject(SPOTIFY_CLIENT)!

const props = defineProps<{
  categoryId: string
}>()

interface State {
  loaded: boolean
  category: Category | null
  playlists: Playlist[]
}

const state = reactive<State>({
  loaded: false,
  category: null,
  playlists: []
})

// eslint-disable-next-line no-unused-vars
const breadcrumbs = computed(() => {
  return [
    {
      text: 'Categories',
      to: '/'
    },
    {
      text: state.category?.name,
      to: `/categories/${props.categoryId}`
    }
  ]
})

await Promise.all([
  (async () => {
    state.category = await spotifyClient.getCategory(props.categoryId)
  })(),
  (async () => {
    state.playlists = await spotifyClient.getCategoryPlaylists(props.categoryId)
  })()
])
state.loaded = true
</script>

<style lang="sass" scoped>
@use '../styles/library'

</style>
