<template>
  <v-app>
    <v-main class="pa-6">
      <v-container>
        <h1 class="text-h4 mb-4">Vuetify 3 Demo Page</h1>
        <v-row class="mb-6" align="center" justify="space-around">
          <h2 class="mb-4">UI package demo</h2>
          <DemoButton />
        </v-row>
        <div class="pa-6">
          <h2 class="mb-4">Core package demos</h2>
          <DemoCoreToggle />
          <v-divider class="my-6" />
          <DemoCoreApi />
        </div>
        <!-- Buttons -->
        <v-row class="mb-6" align="center" justify="space-around">
          <v-btn color="primary">Primary</v-btn>
          <v-btn color="secondary">Secondary</v-btn>
          <v-btn color="success">Success</v-btn>
          <v-btn color="error">Error</v-btn>
          <v-btn variant="outlined">Outlined</v-btn>
        </v-row>


        <!-- Card -->
        <v-card class="mx-auto mb-6" max-width="400">
          <v-card-title>Sample Card</v-card-title>
          <v-card-text>
            This is a Vuetify card component. It helps you group related content.
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="dialog = true">Open Dialog</v-btn>
          </v-card-actions>
        </v-card>


        <!-- Dialog -->
        <v-dialog v-model="dialog" width="400">
          <v-card>
            <v-card-title>Dialog Example</v-card-title>
            <v-card-text>
              If you can see this dialog, Vuetify directives (like v-dialog) work fine!
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="dialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


        <!-- Form Example -->
        <v-card class="pa-4" max-width="400">
          <v-card-title>Simple Form</v-card-title>
          <v-card-text>
            <v-text-field v-model="name" label="Name" prepend-icon="mdi-account" />
            <v-text-field v-model="email" label="Email" prepend-icon="mdi-email" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="submitForm">Submit</v-btn>
          </v-card-actions>
        </v-card>


        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" color="success" timeout="2000">
          Form submitted successfully!
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import DemoButton from './components/DemoButton.vue'
import DemoCoreToggle from './components/DemoCoreToggle.vue'
import DemoCoreApi from './components/DemoCoreApi.vue'


const dialog = ref(false)
const snackbar = ref(false)
const name = ref('')
const email = ref('')


function submitForm() {
  if (name.value && email.value) {
    snackbar.value = true
    name.value = ''
    email.value = ''
  }
}
</script>


<style scoped>
h1 {
  text-align: center;
}
</style>



