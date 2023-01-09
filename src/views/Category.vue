<template>
  <div v-if="loaded" class="library">
    <app-button v-for="playlist in playlists" :key="playlist.id" dark class="library__item" :style="{backgroundImage: `url(${playlist.image})`}" :to="`/categories/${categoryId}/playlists/${playlist.id}`" :title="playlist.name" />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { SPOTIFY_CLIENT } from '../injects'
import { Category, Playlist } from '../services/spotify/types'

const spotifyClient = inject(SPOTIFY_CLIENT)!

const props = defineProps<{
  categoryId: string
}>()

let loaded = false
let category: Category | null = null
let playlists: Playlist[] = []

// eslint-disable-next-line no-unused-vars
const breadcrumbs = computed(() => {
  return [
    {
      text: 'Categories',
      to: '/'
    },
    {
      text: category?.name,
      to: `/categories/${props.categoryId}`
    }
  ]
})

await Promise.all([
  (async () => {
    category = await spotifyClient.getCategory(props.categoryId)
  })(),
  (async () => {
    playlists = await spotifyClient.getCategoryPlaylists(props.categoryId)
  })()
])
loaded = true
</script>

<style lang="sass" scoped>
@use '../common'

</style>
