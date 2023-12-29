<template>
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50
  height: 100vh // fallback
  height: 100dvh
  display: flex
  flex-direction: column
  background-color: #f5f5f5
</style>
