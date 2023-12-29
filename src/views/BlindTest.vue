<script lang="ts" setup>
import { computed, inject, onUnmounted, reactive } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { shuffleArray } from '../util/util'
import { SETTINGS_SERVICE, SPOTIFY_CLIENT } from '@/injects'
import type { Category, Playlist, Track } from '@/services/spotify/types'
import type { ProgressConfig } from '@/components/AppProgress.vue'

const props = defineProps<{
  categoryId?: string
  playlistId: string
}>()
const settingsService = inject(SETTINGS_SERVICE)!
const spotifyClient = inject(SPOTIFY_CLIENT)!

interface State {
  loaded: boolean
  playlist: Playlist | null
  category: Category | null
  started: boolean
  currentTrack: Track | null
  pendingTracks: Track[]
  pastTracks: Track[]
  progressConfig: ProgressConfig
  finished: boolean
}

const state = reactive<State>({
  loaded: false,
  playlist: null,
  category: null,
  started: false,
  currentTrack: null,
  pendingTracks: [],
  pastTracks: [],
  progressConfig: {
    duration: -1,
  },
  finished: false,
})

let stepTimeout = -1

const breadcrumbs = computed(() => {
  const breadcrumbs = [
    {
      text: 'Categories',
      to: '/',
    },
  ]
  if (state.category && state.playlist) {
    breadcrumbs.push(
      {
        text: state.category.name,
        to: `/categories/${props.categoryId}`,
      },
      {
        text: state.playlist.name,
        to: `/categories/${props.categoryId}/playlists/${props.playlistId}`,
      },
    )
  } else if (state.playlist) {
    breadcrumbs.push({
      text: state.playlist.name,
      to: `/playlists/${props.playlistId}`,
    })
  }
  return breadcrumbs
})
breadcrumbs // eslint-disable-line no-unused-expressions

const listenDuration = computed(() => {
  return settingsService.settings.listenDuration * 1000
})
const pauseDuration = computed(() => {
  return settingsService.settings.pauseDuration * 1000
})
const emptyPlaylist = computed(() => {
  return state.playlist?.tracks?.length === 0
})
const canStartBlindTest = computed(() => {
  return spotifyClient.deviceReady.value && !emptyPlaylist.value
})

onBeforeRouteLeave(() => {
  if (state.started) {
    const answer = window.confirm('Do you really want to leave?') // eslint-disable-line no-alert
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
  })(),
])
state.loaded = true

async function startBlindTest() {
  state.started = true
  state.finished = false
  state.pendingTracks = shuffleArray(state.playlist!.tracks!).slice(0, settingsService.settings.numberOfTracks)
  state.pastTracks = []
  window.addEventListener('beforeunload', onBeforeLeaving)
  await stepTrack()
}

async function stepTrack() {
  const [track] = state.pendingTracks.splice(0, 1)
  state.currentTrack = track
  await spotifyClient.play(track.id, getTrackStartPosition(track.duration))
  state.progressConfig = { duration: listenDuration.value, shakeAnimation: true }
  stepTimeout = window.setTimeout(stepPause, state.progressConfig.duration, track)
}
async function stepPause(track: Track) {
  await spotifyClient.pause()
  state.currentTrack = null
  state.pastTracks.push(track)
  if (state.pendingTracks.length > 0) {
    state.progressConfig = { duration: pauseDuration.value }
    stepTimeout = window.setTimeout(stepTrack, state.progressConfig.duration)
  } else {
    state.finished = true
    window.removeEventListener('beforeunload', onBeforeLeaving)
  }
}

async function playTrack(trackId: string): Promise<void> {
  await spotifyClient.play(trackId)
}

// show a confirm dialog to the user
function onBeforeLeaving(event: BeforeUnloadEvent) {
  // Cancel the event
  event.preventDefault()
  // Chrome requires returnValue to be set
  event.returnValue = ''
}

function getTrackStartPosition(trackDuration: number): number {
  switch (settingsService.settings.trackMode) {
    case 'start':
      return 0
    case 'middle':
      return Math.floor(Math.random() * (trackDuration - listenDuration.value))
    case 'end':
      return Math.max(trackDuration - listenDuration.value, 0)
  }
}
</script>

<template>
  <div v-if="state.loaded" flex flex-col items-center>
    <div flex items-center :class="[state.started ? 'flex-row gap-8' : 'flex-col']">
      <div v-if="!state.playlist?.image" i-mdi-music-note />
      <img :src="state.playlist?.image" alt="" :class="[state.started ? 'max-w-30vw max-h-20em' : 'max-w-4/5 max-h-40vh']">
      <h1 my-3rem font-bold line-height-1.5em :class="[state.started ? 'text-2xl xl:text-3xl' : 'text-3xl']">
        {{ state.playlist?.name }}
      </h1>
    </div>

    <div v-if="emptyPlaylist">
      This playlist does not contain any song!
    </div>

    <template v-else>
      <AppButton v-if="!state.started" class="animate-grow" text-2xl :disabled="!canStartBlindTest" @click="startBlindTest()">
        Start the blind test!
      </AppButton>

      <template v-else>
        <div mt-4>
          <TransitionGroup name="fade">
            <div v-for="(track, index) in state.pastTracks" :key="index" h-1.5em flex flex-row items-center lg:text-3xl>
              {{ track.artists[0] }} : {{ track.name }}
              <AppButton v-if="state.finished" tile ml-2 title="Play this track" @click="playTrack(track.id)">
                <div i-mdi-play-circle />
              </AppButton>
            </div>
          </TransitionGroup>
        </div>
        <AppProgress v-if="!state.finished" :config="state.progressConfig" my-4 max-w-2xl w-full />
        <AppGuessInput :track="state.currentTrack" />

        <AppButton v-if="state.finished" mt-4 @click="startBlindTest()">
          Start a new blindtest
        </AppButton>
      </template>
    </template>
  </div>
</template>

<style lang="sass" scoped>
.animate-grow
  animation: 1.5s ease-in infinite alternate scale

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
</style>
