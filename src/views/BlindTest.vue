<template>
  <div v-if="state.loaded" class="blindtest">
    <div class="blindtest__header" :class="{'blindtest__header--row': state.started}">
      <img :src="state.playlist?.image" alt="Playlist logo" class="blindtest__image">
      <h1 class="blindtest__title">
        {{ state.playlist?.name }}
      </h1>
    </div>

    <div v-if="emptyPlaylist">
      This playlist does not contain any song!
    </div>

    <app-button v-if="!state.started" class="blindtest__start-btn" :disabled="!canStartBlindTest" @click="startBlindTest()">
      Start the blind test!
    </app-button>

    <template v-else>
      <transition-group name="fade">
        <div v-for="(track, index) in state.pastTracks" :key="index" class="blindtest__track">
          {{ track.artists[0] }} : {{ track.name }}
          <app-button v-if="state.finished" tile title="Play this track" @click="playTrack(track.id)">
            <icon-mdi-play-circle />
          </app-button>
        </div>
      </transition-group>
      <app-progress v-if="!state.finished" :duration="state.progressDuration" class="blindtest__progress" />

      <app-button v-if="state.finished" class="mt-3" @click="startBlindTest()">
        Start a new blindtest
      </app-button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onUnmounted, reactive } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { SETTINGS_SERVICE, SPOTIFY_CLIENT } from '../injects'
import { Category, Playlist, Track } from '../services/spotify/types'
import { shuffleArray } from '../util/util'

const settings = inject(SETTINGS_SERVICE)!
const spotifyClient = inject(SPOTIFY_CLIENT)!

const props = defineProps<{
  categoryId?: string
  playlistId: string
}>()

interface State {
  loaded: boolean
  playlist: Playlist | null
  category: Category | null
  started: boolean
  pendingTracks: Track[]
  pastTracks: Track[]
  progressDuration: number
  finished: boolean
}

const state = reactive<State>({
  loaded: false,
  playlist: null,
  category: null,
  started: false,
  pendingTracks: [],
  pastTracks: [],
  progressDuration: -1,
  finished: false
})

let stepTimeout = -1

// eslint-disable-next-line no-unused-vars
const breadcrumbs = computed(() => {
  const breadcrumbs = [
    {
      text: 'Categories',
      to: '/'
    }
  ]
  if (state.category && state.playlist) {
    breadcrumbs.push(
      {
        text: state.category.name,
        to: `/categories/${props.categoryId}`
      },
      {
        text: state.playlist.name,
        to: `/categories/${props.categoryId}/playlists/${props.playlistId}`
      }
    )
  } else if (state.playlist) {
    breadcrumbs.push({
      text: state.playlist.name,
      to: `/playlists/${props.playlistId}`
    })
  }
  return breadcrumbs
})

const listenDuration = computed(() => {
  return settings.settings.listenDuration * 1000
})
const pauseDuration = computed(() => {
  return settings.settings.pauseDuration * 1000
})
const emptyPlaylist = computed(() => {
  return state.playlist?.tracks?.length === 0
})
const canStartBlindTest = computed(() => {
  return spotifyClient.deviceReady && !emptyPlaylist.value
})

onBeforeRouteLeave(() => {
  if (state.started) {
    const answer = window.confirm('Do you really want to leave?')
    if (!answer) {
      return false
    }
  }
})

onUnmounted(() => {
  if (state.started && !state.finished) {
    clearTimeout(stepTimeout)
    spotifyClient.pause().catch(() => {})
    window.removeEventListener('beforeunload', onBeforeLeaving)
  }
})

await Promise.all([
  spotifyClient.checkDevices(),
  (async () => {
    if (props.categoryId) {
      state.category = await spotifyClient.getCategory(props.categoryId)
    }
  })(),
  (async () => {
    state.playlist = await spotifyClient.getPlaylist(props.playlistId)
  })()
])
state.loaded = true

async function startBlindTest () {
  state.started = true
  state.finished = false
  state.pendingTracks = shuffleArray(state.playlist!.tracks!).slice(0, settings.settings.numberOfTracks)
  state.pastTracks = []
  window.addEventListener('beforeunload', onBeforeLeaving)
  await stepTrack()
}

async function stepTrack () {
  const [track] = state.pendingTracks.splice(0, 1)
  const startPosition = Math.floor(Math.random() * (track.duration - listenDuration.value))
  await spotifyClient.play(track.id, startPosition)
  state.progressDuration = listenDuration.value
  stepTimeout = window.setTimeout(stepPause, state.progressDuration, track)
}
async function stepPause (track: Track) {
  await spotifyClient.pause()
  state.pastTracks.push(track)
  if (state.pendingTracks.length > 0) {
    state.progressDuration = pauseDuration.value
    stepTimeout = window.setTimeout(stepTrack, state.progressDuration)
  } else {
    state.finished = true
    window.removeEventListener('beforeunload', onBeforeLeaving)
  }
}

async function playTrack (trackId: string): Promise<void> {
  await spotifyClient.play(trackId)
}

// show a confirm dialog to the user
function onBeforeLeaving (event: BeforeUnloadEvent) {
  // Cancel the event
  event.preventDefault()
  // Chrome requires returnValue to be set
  event.returnValue = ''
}
</script>

<style lang="sass" scoped>
.blindtest
  display: flex
  flex-direction: column
  align-items: center

  &__header
    display: flex
    flex-direction: column
    align-items: center

    &--row
      flex-direction: row
      margin-bottom: 1em

      .blindtest__image
        max-width: 30vw
        max-height: 20em
        margin-right: 1em

      .blindtest__title
        font-size: 1.5em
        margin-top: 0
        margin-bottom: 0

        @media (min-width: 1280px)
          font-size: 2em

  &__image
    max-height: 40vh
    max-width: 80%

  &__title
    margin-top: 1em
    margin-bottom: 1em

  &__start-btn
    font-size: 1.4em
    padding: .5em
    margin: 1em

    &:not([disabled])
      animation: 1.5s ease-in infinite alternate scale

  &__back-to-playlists-btn
    position: absolute !important
    top: 5vh
    right: 1vw

  &__progress
    margin-top: 1em
    margin-bottom: 1em
    padding: 1em
    width: 100%
    max-width: 960px

  &__track
    display: flex
    align-items: center

    @media (min-width: 960px)
      font-size: 2em

@keyframes scale
  from
      transform: scale(1)
  to
      transform: scale(1.5)

.fade-enter-active,
.fade-leave-active
  transition: all 1s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0
  transform: translateY(30px)

.mt-3
  margin-top: 16px
</style>
