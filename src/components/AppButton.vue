<script lang="ts" setup>
const props = defineProps({
  tag: {
    type: String,
    default: 'button',
  },
  tile: {
    type: Boolean,
    default: false,
  },
  to: {
    type: String,
    default: '',
  },
  disable: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()

const classes = computed(() => {
  const classes = ['button']
  if (props.tile) {
    classes.push('button--tile')
  }
  return classes
})

const loading = ref(false)

async function handleClick() {
  if (props.to) {
    loading.value = true
    try {
      await router.push(props.to)
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <button :class="classes" :disabled="disable || loading" @click="handleClick">
    <div class="button__content">
      <slot />
    </div>
    <div class="button__overlay" />
  </button>
</template>

<style lang="sass" scoped>
.button
  display: inline-flex
  justify-content: center
  align-items: center
  padding: 8px
  border: none
  background-color: transparent
  font-weight: bold
  transition: .3s
  min-width: 48px
  position: relative
  cursor: pointer

  &[disabled]
    cursor: not-allowed

  &:not(.button--tile,[disabled])
    box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%)

  &__content
    display: inline-flex
    justify-content: center
    align-items: center
    pointer-events: none
    // place the overlay below the content so that only the background gets darker
    z-index: 1

  &__overlay
    position: absolute
    top: 0
    left: 0
    bottom: 0
    right: 0
    transition: all .3s

    &:hover
      background-color: #e7e7e755

  &:active
      background-color: darken(#e7e7e755, 20%)
</style>
