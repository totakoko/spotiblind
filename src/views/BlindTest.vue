<template>
  <div>
    <v-btn
      class="blindtest__back-to-playlists-btn"
      to="/"
    >
      Playlists
    </v-btn>

    <template v-if="playlist">
      <img :src="playlist.image">
      <h1>{{ playlist.name }}</h1>

      <v-progress-linear
        v-model="waitProgress"
        class="blindtest__progress"
        color="indigo darken-1"
        height="10"
      />
      <div
        v-for="(track, index) in pastTracks"
        :key="index"
        class="blindtest__track"
      >
        {{ track.author }} : {{ track.name }}
      </div>

      <v-btn
        v-if="finished"
        class="mt-3"
        @click="restart()"
      >
        Start a new blindtest
      </v-btn>
    </template>
  </div>
</template>

<script>
function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const listenDuration = 20000
const prepareDuration = 5000
const numberOfTracks = 10

export default {
  props: {
    playlistId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    playlist: null,
    tracks: [],
    pastTracks: [],
    currentTrack: 0,
    waitProgress: 0,
    finished: false,
    abort: false
  }),
  async created () {
    if (await this.assertDevicesConnected()) {
      await this.startBlindTest(this.playlistId)
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
    async startBlindTest (playlistId) {
      this.finished = false
      this.pastTracks = []
      const playlist = await this.$spotifyClient.getPlaylist(playlistId)
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
          .sort((a, b) => 0.5 - Math.random())
          .slice(0, numberOfTracks)
      }

      this.currentTrack = 0
      while (this.currentTrack < this.playlist.tracks.length) {
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
          this.waitProgress = (Date.now() - startTime) * 100 / prepareDuration
        }, 32)
        await wait(prepareDuration)

        if (this.abort) {
          return
        }
        clearInterval(timer)

        this.currentTrack++
      }
      this.finished = true
    },
    restart () {
      this.startBlindTest(this.playlistId)
    }
  }

}
</script>

<style lang="sass">

.blindtest
  &__back-to-playlists-btn
    position: absolute !important
    top: 5vh
    right: 1vw

  &__progress
    margin: 2em
    transition: .1s linear !important

  &__track
    font-size: 2em
</style>