<template>
  <div v-if="loaded" class="blindtest">
    <div class="blindtest__header" :class="{'blindtest__header--row': started}">
      <img :src="playlist?.image" class="blindtest__image">
      <h1 class="blindtest__title">
        {{ playlist?.name }}
      </h1>
    </div>

    <app-button v-if="!started" class="blindtest__start-btn" :disabled="missingDevice" @click="startRandomBlindTest()">
      Start the blind test!
    </app-button>

    <template v-else>
      <transition-group name="fade">
        <div v-for="(track, index) in pastTracks" :key="index" class="blindtest__track">
          {{ track.author }} : {{ track.name }}
          <app-button v-if="finished" title="Play this track" @click="playTrack(track.id)">
            <icon-mdi-play-circle />
          </app-button>
        </div>
      </transition-group>
      <progress v-if="!finished" class="blindtest__progress" max="100" :value="waitProgress" />

      <app-button v-if="finished" class="mt-3" @click="startRandomBlindTest()">
        Start a new blindtest
      </app-button>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Category, Playlist, Track } from '../services/spotify'

function wait (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
function shuffle<T extends any> (array: Array<T>): Array<T> {
  const newArr = []
  const source = array.slice()
  while (source.length > 0) {
    const randomIndex = Math.floor(Math.random() * source.length)
    const element = source.splice(randomIndex, 1)
    newArr.push(element[0])
  }

  return array
}

export default defineComponent({
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
    started: false,
    playlist: null as Playlist | null,
    category: null as Category | null,
    pastTracks: [] as Track[],
    currentTrack: 0,
    waitProgress: 0,
    finished: false,
    abort: false
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
      this.abort = true
      this.$spotifyClient.pause().catch(() => {})
    }
  },
  methods: {
    startRandomBlindTest () {
      this.startBlindTest(
        shuffle(this.playlist!.tracks!)
          .slice(0, this.$settings.settings.numberOfTracks)
      )
    },
    async startBlindTest (tracks: Track[]) {
      this.started = true
      this.finished = false
      this.pastTracks = []

      const listenDuration = this.$settings.settings.listenDuration * 1000
      const pauseDuration = this.$settings.settings.pauseDuration * 1000

      this.currentTrack = 0
      while (this.currentTrack < tracks.length) {
        const track = this.playlist!.tracks![this.currentTrack]
        const startPosition = Math.floor(Math.random() * (track.duration - listenDuration))
        await this.$spotifyClient.play(track.id, startPosition)
        this.waitProgress = 0
        let startTime = Date.now()
        let timer = setInterval(() => {
          if (this.abort) {
            clearInterval(timer)
            return
          }
          this.waitProgress = (Date.now() - startTime) * 100 / listenDuration
        }, 32)
        await wait(listenDuration)

        if (this.abort) {
          return
        }
        clearInterval(timer)
        this.waitProgress = 0
        await this.$spotifyClient.pause()
        this.pastTracks.push(track)

        this.waitProgress = 0
        startTime = Date.now()
        timer = setInterval(() => {
          if (this.abort) {
            clearInterval(timer)
            return
          }
          this.waitProgress = (Date.now() - startTime) * 100 / pauseDuration
        }, 32)
        await wait(pauseDuration)

        if (this.abort) {
          return
        }
        clearInterval(timer)

        this.currentTrack++
      }
      this.started = false
      this.finished = true
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
