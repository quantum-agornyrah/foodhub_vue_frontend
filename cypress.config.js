import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'i7z8n3',
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'http://localhost:3000',

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
