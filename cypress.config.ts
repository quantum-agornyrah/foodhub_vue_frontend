import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'jk6vdt',
  // Cypress scrollBehavior accepts: 'center', 'top', 'bottom', 'nearest', false
  scrollBehavior: 'center',

  allowCypressEnv: false,
  watchForFileChanges: false,

  // Cypress Security Config
  env: {
    apiKey: process.env.API_KEY,
    dbPassword: process.env.DB_PASSWORD
  },

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
