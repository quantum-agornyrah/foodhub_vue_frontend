<template>
  <div v-if="error" data-cy="fallback">Something went wrong.</div>
  <slot v-else />
</template>

<script setup>
  import { ref, onErrorCaptured } from 'vue'

  const error = ref(null)

  onErrorCaptured((err) => {
    error.value = err

    // Returning false stops the error from propagating further up the Vue tree,
    // but it still reaches Cypress as an uncaught exception.
    return false
  })
</script>