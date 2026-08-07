import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  watchForFileChanges: false,

  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
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
