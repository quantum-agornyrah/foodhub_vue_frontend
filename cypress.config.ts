import { defineConfig } from "cypress";

export default defineConfig({
  // Cypress scrollBehavior accepts: 'center', 'top', 'bottom', 'nearest', false
  scrollBehavior: 'center',

  allowCypressEnv: false,
  watchForFileChanges: false,

  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
