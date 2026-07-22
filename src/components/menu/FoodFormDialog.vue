<script setup>
  import { ref, watch } from 'vue'
  import { VENDORS } from '@/constants/vendors'

  // Image states
  const imageFile = ref(null)
  const maxSize = 2_000_000 // 2 MB

  // Food type states
  const foodTypes = [...VENDORS, "Other"]
  const otherType = ref('')
  const isValid = ref(false)

  // Form data
  const formData = ref({
    title: '',
    description: '',
    imageUrl: '',
    type: VENDORS[0],
  })

// 1. Declare the two-way v-model binding
// This handles the prop receiving and emitting updates automatically
  const foodDialog = defineModel({
    type: Boolean,
    default: false,
  })

// 2. Declare remaining props  
  const props = defineProps({

    // Food item prop with { title, description, image, vendor_type }
    foodItem: {
      type: Object,
      required: true,
    },

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

  // Form validation for food image
  const imageRules = [
    v => !v || v.size < maxSize || 'Image must be less than 2MB',
  ]

  // Form validation for food vendor - other
  const otherTypeRules = [
    // If text-field is STRICTLY empty
    v => !!v?.trim() || 'Custom vendor type is required',

    // If text-field is less than 2 characters
    v => (v?.trim().length >= 2) || 'Custom vendor type must be at least 2 characters',
  ]

// 5. Watch for food item changes (when editing)
  watch(() => props.foodItem, (newItem) => {
    // Make sure newitem exists or its not null 
    if (!newItem) return

    // Create an already input instance for vendors 
    const isAlreadyDefined = VENDORS.includes(newItem.type)

    // 1. Populate form fields
    formData.value = {
      title: newItem.title || '',
      description: newItem.description || '',
      imageUrl: newItem.imageUrl || '',
      type: isAlreadyDefined ? newItem.type : 'Other',
    }

    // 2. Set custom vendor if 'Other' is seleceted
    otherType.value = isAlreadyDefined ? '' : ( newItem.type || '' )

    // 3. Reset the file input to empty
    imageFile.value = null

    // { immediate: true } ensures your form is properly populated with existing data the second the dialog opens, 
    // without needing a separate onMounted hook.
    // Run immediately when dialog fetches already prefilled data
  }, { immediate: true }) 

  // 6. Watch imageFile for changes
  watch(imageFile, (newFile) => {
    // Revoke/Clear any existing blob image url in the memory
    if (formData.value.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(formData.value.imageUrl)
    }

    // If image file exists, create URL from the image for preview
    if (newFile) {
      formData.value.imageUrl = URL.createObjectURL(newFile)
    } else {
      // Revert to original item image if cleared, or empty string
      formData.value.imageUrl = props.foodItem?.imageUrl || ''
    }
  })

  // Function to execute close
  function handleClose () {
    foodDialog.value = false
  }

  // Function to execute save
  function handleSave() {
    // 1. If form input is valid after validation rules
    if (!isValid.value) return

    // 2. Assign or clean up the OTHER input value to the form
    const finalType = formData.value.type === 'Other'
      ? otherType.value.trim()
      : formData.value.type

    // 3. Execute the save function
    emit('save', {
      // Pass { title, description, imageURL}
      ...formData.value,
      // Pass the vendor type
      type: finalType,
      // Pass raw file explicitly alongside form payload
      imageFile: imageFile.value,
    })
  }

</script>

<template>
  <v-dialog
    max-width="600"
    v-model="foodDialog"
    persistent
  >
    <v-card elevation="0" style="border: 2px solid #D2451E;">
      <!-- Dialog Header -->
      <v-card-title class="px-8" style="background-color: #D2451E;">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center ga-3">
            <v-icon class="mr-2" size="26" color="white">
              mdi-pencil-box-outline
            </v-icon>
            <h2 class="text-title-medium font-weight-bold text-white">
              Edit Food Item
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
        <v-form v-model="isValid">
          <!-- Food Title -->
          <div>
            <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
              <v-icon class="mr-2">mdi-food-outline</v-icon>
              Food Title *
            </label>

            <v-text-field
              v-model="formData.title"
              density="comfortable"
              placeholder="e.g. Jollof Rice"
              :rules="titleRules"
              style="border-color: #D2451E;"
              variant="outlined"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
              <v-icon class="mr-2">mdi-note-text-outline</v-icon>
              Description
            </label>

            <v-textarea
              v-model="formData.description"
              placeholder="e.g. Jollof Rice with chicken and pepper"
              rows="3"
              variant="outlined"
            />
          </div>

          <!-- Image Upload -->
          <div>
            <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
              Upload Food Picture
            </label>

            <v-file-input
              v-model="imageFile"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              density="comfortable"
              placeholder="Pick an image"
              prepend-inner-icon="mdi-camera"
              :rules="imageRules"
              show-size
              variant="outlined"
            />
          </div>

          <!-- Vendor Type -->
          <div>
            <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
              <v-icon class="mr-2">mdi-format-text-rotation-vertical</v-icon>
              Vendor Type
            </label>

            <v-select
              v-model="formData.type"
              density="comfortable"
              :items="foodTypes"
              variant="outlined"
            />
          </div>
          <!-- Custom Vendor Type (Other) -->
           <v-expand-transition>
            <div v-if="formData.type === 'Other'" class="mb-4">
              <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
                <v-icon class="mr-2"> mdi-pencil-box-outline</v-icon>
                  Custom Vendor Type *
              </label>
              <v-text-field
                v-model="otherType"
                density="comfortable"
                placeholder="e.g. Local Joint"
                :rules="otherTypeRules"
                variant="outlined"
              />
            </div>
           </v-expand-transition>

          <!-- Image Preview -->
          <div v-if="formData.imageUrl" class="mb-4">
            <label class="font-weight-bold mb-2 d-block" style="color: #1E1E1E;">
              Preview
            </label>

            <v-card class="pa-3" elevation="0" style="border: 1px solid #E0E0E0;">
              <div class="d-flex ga-3 align-center">
                <v-avatar rounded="lg" size="64">
                  <v-img
                    :alt="formData.title"
                    cover
                    :src="formData.imageUrl"
                  >
                    <template #error>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                        <v-icon color="grey">mdi-image-broken</v-icon>
                      </div>
                    </template>
                  </v-img>
                </v-avatar>

                <div>
                  <div class="font-weight-bold" style="color: #1E1E1E;">
                    {{ formData.title || 'Food Title' }}
                  </div>

                  <div class="text-caption" style="color: #666666;">
                    {{ formData.description }}
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </v-form>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions class="pa-4 pa-sm-6 pt-0 d-flex flex-column-reverse flex-sm-row justify-end ga-3">
        <v-spacer class="d-none d-sm-block" />

        <v-btn
          class="text-capitalize font-weight-bold px-sm-14 w-100 w-sm-auto"
          color="#1E1E1E"
          variant="outlined"
          @click="handleClose"
        >
          Cancel
        </v-btn>

        <v-btn
          class="text-capitalize font-weight-bold px-sm-14 w-100 w-sm-auto ml-0 ml-sm-2"
          color="#D2451E"
          :disabled="!isValid || loading"
          :loading="loading"
          variant="flat"
          @click="handleSave"
        >
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
