<template>
    <button @click="increment">increment {{ count }}</button>
    
    you clicked button 
        <span data-testid="num">
            {{ count }}
        </span> times
    
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>