<template>
  <div v-if="loaded" class="blindtest">
    <div class="blindtest__header" :class="{'blindtest__header--row': started}">
      <img :src="playlist?.image" class="blindtest__image">
      <h1 class="blindtest__title">
        {{ playlist?.name }}
      </h1>
    </div>

    <app-button v-if="!started" class="blindtest__start-btn" :disabled="missingDevice" @click="startBlindTest()">
      Start the blind test!
    </app-button>

    <template v-else>
      <transition-group name="fade">
        <div v-for="(track, index) in pastTracks" :key="index" class="blindtest__track">
          {{ track.author }} : {{ track.name }}
          <app-button v-if="finished" tile title="Play this track" @click="playTrack(track.id)">
            <icon-mdi-play-circle />
          </app-button>
        </div>
      </transition-group>
      <app-progress v-if="!finished" :duration="progressDuration" class="blindtest__progress" />

      <app-button v-if="finished" tile class="mt-3" @click="startBlindTest()">
        Start a new blindtest
      </app-button>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppProgress from '../components/AppProgress.vue'
import { Category, Playlist, Track } from '../services/spotify'
import { shuffleArray } from '../util/util'

export default defineComponent({
  components: { AppProgress },
  props: {
    categoryId: {
      type: String,
      default: null
    },
    playlistId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    loaded: false,
    playlist: null as Playlist | null,
    category: null as Category | null,

    started: false,
    pendingTracks: [] as Track[],
    pastTracks: [] as Track[],
    progressDuration: -1,
    finished: false,
    stepTimeout: -1
  }),
  computed: {
    missingDevice (): boolean {
      return this.$spotifyClient.devices.value.length === 0
    },
    breadcrumbs () {
      const breadcrumbs = [
        {
          text: 'Categories',
          to: '/'
        }
      ]
      if (this.category && this.playlist) {
        breadcrumbs.push(
          {
            text: this.category.name,
            to: `/categories/${this.categoryId}`
          },
          {
            text: this.playlist.name,
            to: `/categories/${this.categoryId}/playlists/${this.playlistId}`
          }
        )
      } else if (this.playlist) {
        breadcrumbs.push({
          text: this.playlist.name,
          to: `/playlists/${this.playlistId}`
        })
      }
      return breadcrumbs
    },
    listenDuration (): number {
      return this.$settings.settings.listenDuration * 1000
    },
    pauseDuration (): number {
      return this.$settings.settings.pauseDuration * 1000
    }
  },
  async created () {
    await Promise.all([
      this.$spotifyClient.checkDevices(),
      (async () => {
        if (this.categoryId) {
          this.category = await this.$spotifyClient.getCategory(this.categoryId)
        }
      })(),
      (async () => {
        const playlist = await this.$spotifyClient.getPlaylist(this.playlistId)
        this.playlist = {
          id: playlist.id,
          name: playlist.name,
          image: playlist.images[0].url,
          tracks: playlist.tracks.items.map((track: any) => {
            return {
              id: track.track.id,
              name: track.track.name,
              author: track.track.artists[0].name,
              duration: track.track.duration_ms
            }
          })
        }
      })()
    ])
    this.loaded = true
  },
  unmounted () {
    if (!this.finished) {
      clearTimeout(this.stepTimeout)
      this.$spotifyClient.pause().catch(() => {})
    }
  },
  methods: {
    async startBlindTest () {
      this.started = true
      this.finished = false
      this.pendingTracks = shuffleArray(this.playlist!.tracks!).slice(0, this.$settings.settings.numberOfTracks)
      this.pastTracks = []
      await this.stepTrack()
    },

    async stepTrack () {
      const [track] = this.pendingTracks.splice(0, 1)
      const startPosition = Math.floor(Math.random() * (track.duration - this.listenDuration))
      await this.$spotifyClient.play(track.id, startPosition)
      this.progressDuration = this.listenDuration
      this.stepTimeout = setTimeout(this.stepPause.bind(this), this.listenDuration, track)
    },
    async stepPause (track: Track) {
      await this.$spotifyClient.pause()
      this.pastTracks.push(track)
      if (this.pendingTracks.length > 0) {
        this.progressDuration = this.pauseDuration
        this.stepTimeout = setTimeout(this.stepTrack.bind(this), this.pauseDuration)
      } else {
        this.finished = true
      }
    },

    async playTrack (trackId: string): Promise<void> {
      await this.$spotifyClient.play(trackId)
    }
  }
})
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

</style>
