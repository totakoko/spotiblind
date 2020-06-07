<template>
  <div class="library">
    <v-btn
      v-for="category in categories"
      :key="category.id"
      class="library__item"
      :style="{backgroundImage: `url(${category.image})`}"
      :to="`/categories/${category.id}`"
    >
      {{ category.name }}
    </v-btn>
  </div>
</template>

<script>
export default {
  data: () => ({
    categories: []
  }),
  async created () {
    this.categories = await this.$spotifyClient.getCategories()
  }
}
</script>

<style lang="sass" scoped>
@use '../styles/library'

.library__item
  font-size: 1.2em !important
  font-weight: 400 !important
  color: white !important
  text-transform: initial !important

  ::v-deep .v-btn__content
    position: absolute
    bottom: .6em
    white-space: pre-line
    text-align: center

</style>
