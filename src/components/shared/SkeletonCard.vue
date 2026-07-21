<!-- For each IMAGE, HEADING and SUBTITLE -->
<!-- Image placeholder becomes a gray rectangle,
 Title or Heading placeholder becomes a thick gray line and
 Subtitle or Text becomes a thin gray line -->

<template>
  <v-card 
    variant="flat" 
    class="pa-4" 
    style="border: 1px solid #E0E0E0; border-radius: 8px;"
  >
    <v-skeleton-loader 
      type="image, heading, subtitle" 
    />
  </v-card>
</template>