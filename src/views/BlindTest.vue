<template>
  <div
    v-if="loaded"
    class="blindtest"
  >
    <v-breadcrumbs :items="breadcrumbs" />

    <img :src="playlist.image">
    <h1>{{ playlist.name }}</h1>

    <div class="blindtest__progress">
      <v-progress-linear
        v-model="waitProgress"
        color="indigo darken-1"
        height="10"
      />
    </div>

    <div
      v-for="(track, index) in pastTracks"
      :key="index"
      class="blindtest__track"
    >
      {{ track.author }} : {{ track.name }}
      <v-btn
        v-if="finished"
        icon
        title="Play this track"
        @click="playTrack(track.id)"
      >
        <v-icon>mdi-play-circle</v-icon>
      </v-btn>
    </div>

    <v-btn
      v-if="finished"
      class="mt-3"
      @click="startRandomBlindTest()"
    >
      Start a new blindtest
    </v-btn>
  </div>
</template>

<script>
function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  props: {
    categoryId: {
      type: String,
      required: true
    },
    playlistId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    loaded: false,
    playlist: null,
    category: null,
    pastTracks: [],
    currentTrack: 0,
    waitProgress: 0,
    finished: false,
    abort: false
  }),
  computed: {
    breadcrumbs () {
      return [
        {
          text: 'Categories',
          to: '/'
        },
        {
          text: this.category.name,
          to: `/categories/${this.categoryId}`,
          exact: true
        },
        {
          text: this.playlist.name,
          to: `/categories/${this.categoryId}/playlists/${this.playlistId}`
        }
      ]
    }
  },
  async created () {
    if (await this.assertDevicesConnected()) {
      await Promise.all([
        (async () => {
          this.category = await this.$spotifyClient.getCategory(this.categoryId)
        })(),
        (async () => {
          const playlist = await this.$spotifyClient.getPlaylist(this.playlistId)
          this.playlist = {
            name: playlist.name,
            image: playlist.images[0].url,
            tracks: playlist.tracks.items.map(track => {
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

      this.startRandomBlindTest()
    }
  },
  destroyed () {
    if (!this.finished) {
      this.abort = true
      this.$spotifyClient.pause().catch(() => {})
    }
  },
  methods: {
    async assertDevicesConnected () {
      try {
        const devices = await this.$spotifyClient.getAvailableDevices()
        console.log(devices)
        if (devices.length === 0) {
          console.log('no device found')
          return false
        }
        if (devices.every(device => !device.is_active)) {
          await this.$spotifyClient.transferPlayback(devices[0].id)
        }
        return true
      } catch (error) {
        console.log('could not get devices', error)
        return false
      }
    },
    startRandomBlindTest () {
      this.startBlindTest(
        this.playlist.tracks
          .sort((a, b) => 0.5 - Math.random())
          .slice(0, this.$settings.settings.numberOfTracks)
      )
    },
    async startBlindTest (tracks) {
      this.finished = false
      this.pastTracks = []

      const listenDuration = this.$settings.settings.listenDuration * 1000
      const pauseDuration = this.$settings.settings.pauseDuration * 1000

      this.currentTrack = 0
      while (this.currentTrack < tracks.length) {
        const track = this.playlist.tracks[this.currentTrack]
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
      this.finished = true
    },
    async playTrack (trackId) {
      await this.$spotifyClient.play(trackId)
    }
  }

}
</script>

<style lang="sass">
.blindtest
  display: flex
  flex-direction: column
  align-items: center

  &__back-to-playlists-btn
    position: absolute !important
    top: 5vh
    right: 1vw

  &__progress
    padding: 2em
    width: 100%
    max-width: 800px
    transition: .1s linear !important

  &__track
    font-size: 2em
</style>
