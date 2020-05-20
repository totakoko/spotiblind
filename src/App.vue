<template>
  <v-app>
    <div class="blindtest">
      <router-view />
    </div>
  </v-app>
</template>

<style lang="sass">
html,
body
  height: 100vh

.blindtest
  height: 100%
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  padding: 10vw
</style>
