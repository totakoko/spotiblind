<template>
  <div class="pa-3">
    <h1>Settings</h1>
    <p>These settings are stored on a per-device basis. Connecting from another device will load the default settings.</p>

    <app-button @click="loadDefaultSettings()">
      Reset settings
    </app-button>

    <div class="form-field">
      <label for="tracks">Number of tracks per blind test</label>
      <app-input id="tracks" v-model.number="settings.numberOfTracks" type="number" min="1" max="100" />
    </div>
    <div class="form-field">
      <label for="listen">Listen duration per track (in seconds)</label>
      <app-input id="listen" v-model.number="settings.listenDuration" type="number" min="1" max="90" />
    </div>
    <div class="form-field">
      <label for="pause">Pause between tracks (in seconds)</label>
      <app-input id="pause" v-model.number="settings.pauseDuration" type="number" min="0" max="60" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data () {
    return {
      settings: this.$settings.settings
    }
  },
  methods: {
    loadDefaultSettings () {
      this.$settings.reset()
    }
  }
})
</script>

<style lang="sass" scoped>
.form-field
  margin: .5em 0

  label
    margin-right: 1em
    cursor: pointer
</style>
