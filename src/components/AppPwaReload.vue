<template>
  <div v-if="needRefresh" class="pwa-toast" role="alert">
    <div class="message">
      New content available, click on reload button to update.
    </div>
    <app-button v-if="needRefresh" @click="updateServiceWorker()">
      Reload
    </app-button>
    <app-button @click="close()">
      Close
    </app-button>
  </div>
</template>

<script lang="ts" setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  needRefresh,
  updateServiceWorker
} = useRegisterSW()

async function close () {
  needRefresh.value = false
}
</script>

<style lang="sass" scoped>
.pwa-toast
  position: fixed
  right: 0
  bottom: 0
  margin: 16px
  padding: 12px
  border: 1px solid #8885
  border-radius: 4px
  z-index: 1
  text-align: left
  background-color: #ffffff
  box-shadow: 3px 4px 5px 0px #8885

  & .message
    margin-bottom: 8px
</style>
