// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001', // Replace with your app's local URL
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
