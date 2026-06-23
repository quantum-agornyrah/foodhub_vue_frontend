<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
    order: Object,
    readonly: Boolean, // If true, HR is just reading it
    loading: Boolean
  })

  const emit = defineEmits(['update:modelValue', 'submit-review'])

  const rating = ref(0)
  const comment = ref('')

  watch([() => props.modelValue, () => props.order], () => {
    if (props.modelValue && props.order) {
      rating.value = props.order.rating || 0
      comment.value = props.order.comment || ''
    }
  })

  function handleClose () {
    resetForm()
    emit('update:modelValue', false)
  }

  function submit () {
    emit('submit-review', { id: props.order.id, rating: rating.value, comment: comment.value })
  }

  function resetForm () {
  rating.value = 0
  comment.value = ''
  }
</script>

<template>
  <v-dialog
    max-width="600"
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card elevation="0" style="border: 2px solid #D2451E;">
      <!-- Dialog Header -->
      <v-card-title class="px-8" style="background-color: #D2451E;">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-icon class="mr-2" color="white">
              {{ readonly ? 'mdi-comment-text-multiple-outline' : 'mdi-star-face' }}
            </v-icon>
            <h2 class="text-title-large font-weight-bold text-white">
              {{ readonly ? 'Staff Review' : 'Review Your Meal' }}
            </h2>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="handleClose"
          />
        </div>
      </v-card-title>

      <!-- Dialog Content -->
      <v-card-text class="px-8 pt-10">
        <!-- Rating -->
        <div>
          <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
            <v-icon class="mr-2">mdi-star-outline</v-icon>
            Rating *
          </label>

          <v-rating
            v-model="rating"
            color="amber"
            :readonly="readonly"
            size="large"
          />
        </div>

        <!-- Comments -->
        <div>
          <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
            <v-icon class="mr-2">mdi-note-text-outline</v-icon>
            Comment *
          </label>

          <v-textarea
            v-model="comment"
            placeholder="e.g. The Jollof Rice was a bit salty"
            :readonly="readonly"
            rows="3"
            variant="outlined"
          />
        </div>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />

        <v-btn
          v-if="!readonly"
          class="text-capitalize font-weight-bold px-8"
          color="#D2451E"
          variant="outlined"
          @click="resetForm"
        >
          Reset
        </v-btn>

        <v-btn
          v-if="!readonly"
          class="text-capitalize font-weight-bold px-8"
          color="#D2451E"
          variant="flat"
          :disabled="loading"
          :loading="loading"
          @click="submit"
        >
          Submit Review
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
