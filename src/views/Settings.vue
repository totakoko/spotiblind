<script lang="ts" setup>
import { SETTINGS_SERVICE } from '@/injects'

const settingsService = inject(SETTINGS_SERVICE)!
</script>

<template>
  <div p-2>
    <h1 text-3xl font-bold line-height-2em>
      Settings
    </h1>
    <p>These settings are stored on a per-device basis. Connecting from another device will load the default settings.</p>

    <AppButton my-4 @click="settingsService.reset()">
      Reset settings
    </AppButton>

    <div my-3>
      <label for="tracks" mr-4 cursor-pointer>Number of tracks per blind test</label>
      <AppInput id="tracks" v-model.number="settingsService.settings.numberOfTracks" type="number" min="1" max="100" />
    </div>
    <div my-3>
      <label for="listen" mr-4 cursor-pointer>Listen duration per track (in seconds)</label>
      <AppInput id="listen" v-model.number="settingsService.settings.listenDuration" type="number" min="1" max="90" />
    </div>
    <div my-3>
      <label for="pause" mr-4 cursor-pointer>Pause between tracks (in seconds)</label>
      <AppInput id="pause" v-model.number="settingsService.settings.pauseDuration" type="number" min="0" max="60" />
    </div>
    <div my-3>
      <label for="trackMode" mr-4 cursor-pointer>Track Mode</label>
      <select
        id="trackMode"
        v-model="settingsService.settings.trackMode"
        cursor-pointer appearance-none border-2 border-gray rounded bg-white px-2 py-1 transition-300 hover:bg-gray-200
      >
        <option value="start">
          Start
        </option>
        <option value="middle">
          Middle
        </option>
        <option value="end">
          End
        </option>
      </select>
    </div>
  </div>
</template>
