<script setup>
  import { computed, ref, watch } from 'vue'
  import { VENDORS } from '@/constants/vendors'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue', 'save'])

  const rows = ref([])

  const vendorOptions = [...VENDORS, 'Other']

  function createEmptyRow (){
    return {
        title: '',
        description: '',
        type: VENDORS[0],
        otherType: '',
        imageFile: null,
        imageUrl: '',
    }
  }

  function resetRows () {
    rows.value = [createEmptyRow()]
  }

  function addRow () {
    rows.value.push(createEmptyRow())
  }

  function removeRow (index) {
    if (rows.value.length === 1) {
      resetRows()
      return
    }

    rows.value.splice(index, 1)
  }

  function closeDialog () {
    emit('update:modelValue', false)
  }

  function handleRowFileUpload (index, file) {
    if(file){
        rows.value[index].imageUrl = URL.createObjectURL(file)
    } else{
        rows.value[index].imageUrl = ''
    }
  }

  function normalizeRow (row) {
    return {
      title: row.title.trim(),
      description: row.description?.trim() || '',
      type: row.type === 'Other' ? row.otherType.trim() : row.type,
      imageFile: row.imageFile,
      imageUrl: row.imageUrl,
      status: null,
    }
  }

  const normalizedRows = computed(() => {
    return rows.value
      .map(row => normalizeRow(row))
      .filter(row => row.title || row.description || row.type)
  })

  const hasValidRows = computed(() => {
    if (normalizedRows.value.length === 0) return false

    return rows.value.every(row => {
      const titleIsValid = row.title.trim().length >= 3
      const typeIsValid = row.type !== 'Other' || row.otherType.trim().length >= 2

      return titleIsValid && typeIsValid
    })
  })

  function saveRows () {
    if (!hasValidRows.value) return
    emit('save', normalizedRows.value)
  }

  watch(() => props.modelValue, isOpen => {
    if (isOpen) {
      resetRows()
    }
  }, { immediate: true })
</script>

<template>
  <v-dialog
    max-width="900"
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card elevation="0" style="border: 2px solid #D2451E;">
      <v-card-title class="px-8" style="background-color: #D2451E;">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-icon color="white">mdi-format-list-bulleted-triangle </v-icon>
            <h2 class="text-title-large font-weight-bold text-white">
              Add Multiple Food Items
            </h2>
          </div>

          <v-btn
            color="white"
            icon="mdi-close"
            variant="text"
            @click="closeDialog"
          />
        </div>
      </v-card-title>

      <v-card-text class="px-8 pt-8">
        <v-form>
          <div class="d-flex flex-column ga-4">
            <v-card
              v-for="(row, index) in rows"
              :key="index"
              class="pa-4"
              elevation="0"
              style="border: 1px solid #D2451E;"
            >
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="font-weight-bold" style="color: #1E1E1E;">
                  Item {{ index + 1 }}
                </div>

                <v-btn
                  color="#D2451E"
                  prepend-icon="mdi-delete-outline"
                  variant="flat"
                  @click="removeRow(index)"
                > 
                  Remove Item
                </v-btn>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="row.title"
                    density="comfortable"
                    label="Food Title *"
                    placeholder="e.g. Jollof Rice"
                    :rules="[
                      v => !!v || 'Title is required',
                      v => (v && v.trim().length >= 3) || 'Title must be at least 3 characters',
                    ]"
                    variant="outlined"
                  />
                </v-col>

                <!-- Description -->
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="row.description"
                    density="comfortable"
                    label="Description"
                    placeholder="e.g. Rice with chicken and pepper"
                    rows="2"
                    variant="outlined"
                  />
                </v-col>

                <!-- Image Upload -->
                <v-col cols="12" md="4">
                  <v-file-input
                    v-model="row.imageFile"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    density="comfortable"
                    label="Upload Food Image"
                    placeholder="Pick an image"
                    prepend-icon="mdi-camera"
                    show-size
                    variant="outlined"
                    @update:model-value="file => handleRowFileUpload(index, file)"
                  />
                </v-col>

                 <!-- Vendor Type -->
                <v-col cols="12" md="4">
                  <v-select
                    v-model="row.type"
                    density="comfortable"
                    :items="vendorOptions"
                    label="Vendor Type"
                    variant="outlined"
                  />
                </v-col>

                <v-col v-if="row.type === 'Other'" cols="12" md="3">
                  <v-text-field
                    v-model="row.otherType"
                    density="comfortable"
                    label="Custom Vendor *"
                    placeholder="e.g. Local Joint"
                    :rules="[
                      v => !!v || 'Custom vendor is required',
                      v => (v && v.trim().length >= 2) || 'At least 2 characters',
                    ]"
                    variant="outlined"
                  />
                </v-col>

              </v-row>
            </v-card>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          class="text-capitalize font-weight-bold px-5"
          color="#D2451E"
          prepend-icon="mdi-plus"
          variant="outlined"
          @click="addRow"
        >
          Add row
        </v-btn>

        <v-spacer />

        <v-btn
          class="text-capitalize font-weight-bold px-10"
          color="#1E1E1E"
          :disabled="loading"
          variant="outlined"
          @click="closeDialog"
        >
          Cancel
        </v-btn>

        <v-btn
          class="text-capitalize font-weight-bold px-10"
          color="#D2451E"
          :disabled="!hasValidRows || loading"
          :loading="loading"
          variant="flat"
          @click="saveRows"
        >
          Save all
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>