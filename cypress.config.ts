import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'd6xd7q',
  allowCypressEnv: false,

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
