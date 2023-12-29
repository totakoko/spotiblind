<script lang="ts" setup>
import type { Category, Playlist } from '@/services/spotify/types'
import { SPOTIFY_CLIENT } from '@/injects'

const props = defineProps<{
  categoryId: string
}>()

const spotifyClient = inject(SPOTIFY_CLIENT)!

interface State {
  loaded: boolean
  category: Category | null
  playlists: Playlist[]
}

const state = reactive<State>({
  loaded: false,
  category: null,
  playlists: [],
})

await Promise.all([
  (async () => {
    state.category = await spotifyClient.getCategory(props.categoryId)
  })(),
  (async () => {
    state.playlists = await spotifyClient.getCategoryPlaylists(props.categoryId)
  })(),
])
state.loaded = true
</script>

<template>
  <div v-if="state.loaded" class="library">
    <AppButton v-for="playlist in state.playlists" :key="playlist.id" c-white class="library__item" :style="{ backgroundImage: `url(${playlist.image})` }" :to="`/categories/${categoryId}/playlists/${playlist.id}`" :title="playlist.name" />
  </div>
</template>

<style lang="sass" scoped>
@use '../styles/library'
</style>
