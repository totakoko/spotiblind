<template>
  <div class="library">
    <v-btn
      v-for="category in categories"
      :key="category.id"
      class="library__category-btn"
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

<style lang="sass">
$playlist-btn-width: 200px

.library
  display: flex
  justify-content: space-evenly
  flex-wrap: wrap
  width: 100%

  &__category-btn
    height: $playlist-btn-width !important
    width: $playlist-btn-width !important
    font-size: 1.2em !important
    font-weight: 400 !important
    margin: 1rem
    background-size: cover
    color: white !important
    text-transform: initial !important

    .v-btn__content
      position: absolute
      bottom: 2em

</style>
