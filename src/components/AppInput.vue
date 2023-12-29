<script lang="ts" setup>
const props = defineProps({
  type: {
    type: String as () => 'text' | 'number',
    default: 'text',
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
}>()
</script>

<template>
  <input
    border-2 border-gray rounded px-2 line-height-2em transition-300 invalid:border-red hover:bg-gray-200 invalid:c-red invalid:outline-red
    :type="props.type" :value="props.modelValue" @input="emit('update:modelValue', ($event.target as HTMLInputElement)!.value)"
  >
</template>
