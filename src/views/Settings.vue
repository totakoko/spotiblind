<template>
  <div class="pa-3">
    <h1>Settings</h1>
    <p>These settings are stored on a per-device basis. Connecting from another device will load the default settings.</p>

    <v-text-field
      v-model.number="settings.numberOfTracks"
      type="number"
      label="Number of tracks per blind test"
      min="1"
      max="100"
    />
    <v-text-field
      v-model.number="settings.listenDuration"
      type="number"
      label="Listen duration per track (in seconds)"
      min="1"
      max="90"
    />
    <v-text-field
      v-model.number="settings.pauseDuration"
      type="number"
      label="Pause between tracks (in seconds)"
      min="0"
      max="60"
    />
  </div>
</template>

<script>
export default {
  data () {
    return {
      settings: null
    }
  },
  watch: {
    'settings.listenDuration': {
      handler (value) {
        this.$settings.updateSetting('listenDuration', value)
      }
    },
    'settings.numberOfTracks': {
      handler (value) {
        this.$settings.updateSetting('numberOfTracks', value)
      }
    },
    'settings.pauseDuration': {
      handler (value) {
        this.$settings.updateSetting('pauseDuration', value)
      }
    }
  },
  created () {
    this.settings = Object.assign({}, this.$settings.settings)
  }
}
</script>

<style lang="sass">
</style>
