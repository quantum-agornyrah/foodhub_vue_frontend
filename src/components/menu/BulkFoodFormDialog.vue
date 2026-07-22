<script setup>
  import { useDisplay } from 'vuetify'
  import { computed, ref, watch } from 'vue'
  import { VENDORS } from '@/constants/vendors'

  const { mobile } = useDisplay()

  // Define rows for array of food item objects
  const rows = ref([])
  const formRef = ref(null)

  // Image size
  const maxSize = 2_000_000 // 2 MB

  // Food type state
  const vendorOptions = [...VENDORS, 'Other']

// 1. Declare the two-way v-model binding
// This handles the prop receiving and emitting updates automatically
  const bulkDialog = defineModel({
    type: Boolean,
    default: false,
  })

// 2. Declare remaining props  
  const props = defineProps({
    // Loading annimation prop
    loading: {
      type: Boolean,
      default: false,
    },
  })

// 3. Declare custom action emits
// Even listener for save button  
  const emit = defineEmits(['save'])

// 4. Validation 
  // Form validation for food title
  const titleRules = [
    v => !!v?.trim() || 'Title is required',
    v => (v?.trim().length >= 3) || 'Title must be at least 3 characters',
  ]

  // Form validation for food vendor - other
  const vendorRule = [
    // If text-field is STRICTLY empty
    v => !!v?.trim() || 'Custom vendor type is required',

    // If text-field is less than 2 characters
    v => (v?.trim().length >= 2) || 'Custom vendor type must be at least 2 characters',
  ]

  // Form validation for food image
  const imageRules = [
    v => !v || v.size < maxSize || 'Image must be less than 2MB',
  ]

  // Fuction to create a new item section with parameters
  function createEmptyRow (){
    return {
        title: '',
        description: '',
        type: VENDORS[0],
        otherType: '',
        imageFile: null,
    }
  }

  // Function to reset rows
  function resetRows () {
    rows.value = [createEmptyRow()]
  }

  // Function to add a new item section/row
  function addRow () {
    rows.value.push(createEmptyRow())
  }

  // Function to delete an item section/row
  function removeRow (index) {
    // Clear fields when only one item exists
    if (rows.value.length === 1) {
      resetRows()
      return
    }
    // A method to remove one item at a time starting from the active item section
    rows.value.splice(index, 1)
  }

  // Function to close dialog
  function closeDialog () {
    bulkDialog.value = false
  }

  // Function to polish inputs and assign values.
  function polishRowInputs (row) {
    return {
      title: row.title?.trim(),
      description: row.description?.trim() || '',
      type: row.type === 'Other' ? row.otherType.trim() : row.type,
      imageFile: row.imageFile,
      status: null,
    }
  }

  // For every row, align/map its inputs with the polishrowinputs function
  const normalizedRows = computed(() => {
    return rows.value.map(row => polishRowInputs(row))
  })

// 5. Function to validate inputs; more like input rules
  async function saveRows() {
    // 1. If form input is valid after validation rules
    if (!formRef.value) return

    // 2. Validate all inputs using their rules
    const { valid } = await formRef.value.validate()

    // 3. Prevent save if any row fails validation or if no valid rows exist
    if (!valid || normalizedRows.value.length === 0) return

    emit('save', normalizedRows.value)
  }

  // Watch for food item inputs when dialog opens
  watch(bulkDialog, (isOpen) => {
    if (isOpen) {
      resetRows()
    }
  }, { immediate: true })

</script>

<template>
  <v-dialog
    max-width="600"
    v-model="bulkDialog"
    persistent
  >
    <v-card elevation="0" style="border: 2px solid #D2451E;">
      <v-card-title class="px-8" style="background-color: #D2451E;">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-icon color="white" size="26">mdi-format-list-bulleted-triangle </v-icon>
            <h2 class="text-title-medium font-weight-bold text-white">
              Add Food Items
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
        <v-form ref="formRef">
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
                  :icon="mobile"
                  :variant="mobile ? 'text' : 'flat'"
                  @click="removeRow(index)"
                > 
                  <v-icon :class="{ 'mr-sm-2': !mobile }">mdi-delete-outline</v-icon>
                  <span class="d-none d-lg-inline">Remove Item</span>
                </v-btn>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="row.title"
                    density="comfortable"
                    label="Food Title *"
                    placeholder="e.g. Jollof Rice"
                    :rules="titleRules"
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
                <v-col cols="12" md="6">
                  <v-file-input
                    v-model="row.imageFile"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    density="comfortable"
                    label="Upload Food Image"
                    placeholder="Pick an image"
                    prepend-icon="mdi-camera"
                    show-size
                    :rules="imageRules"
                    variant="outlined"
                  />
                </v-col>

                 <!-- Vendor Type -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="row.type"
                    density="comfortable"
                    :items="vendorOptions"
                    label="Vendor Type"
                    variant="outlined"
                  />
                </v-col>

                <v-col v-if="row.type === 'Other'" cols="12" md="12">
                  <v-text-field
                    v-model="row.otherType"
                    density="comfortable"
                    label="Custom Vendor Type *"
                    placeholder="e.g. Local Joint"
                    :rules="vendorRule"
                    variant="outlined"
                  />
                </v-col>

              </v-row>
            </v-card>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pa-sm-6 pt-0 d-flex flex-column flex-sm-row ga-3">
        <v-btn
          class="text-capitalize font-weight-bold px-5 w-100 w-sm-auto"
          color="#D2451E"
          prepend-icon="mdi-plus"
          variant="outlined"
          @click="addRow"
        >
          Add row
        </v-btn>

        <v-spacer />

        <v-btn
          class="text-capitalize font-weight-bold px-sm-10 w-100 w-sm-auto"
          color="#1E1E1E"
          :disabled="loading"
          variant="outlined"
          @click="closeDialog"
        >
          Cancel
        </v-btn>

        <v-btn
          class="text-capitalize font-weight-bold px-sm-10 w-100 w-sm-auto ml-0 ml-sm-2"
          color="#D2451E"
          :disabled="loading"
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