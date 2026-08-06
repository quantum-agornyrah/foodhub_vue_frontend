// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

import { mount } from 'cypress/vue'

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.

// 1. MOUNTING COMMAND
Cypress.Commands.add('mount', mount)
// Example use:
// cy.mount(MyComponent) in every spec file without importing it

import Vuetify from 'vuetify/lib'
import { VApp } from 'vuetify'
import { mount } from 'cypress/vue'
import { h } from 'vue'

const vuetifyOptions = {}

// 2. VUETIFY COMMAND
Cypress.Commands.add('mount', (component, ...args) => {
  args.global = args.global || {}
  args.global.plugins = args.global.plugins || []
  args.global.plugins.push(new Vuetify(vuetifyOptions))

  return mount(
    () => {
      return h(VApp, {}, component)
    },
    ...args
  )
})


import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '../../src/router'

// 4. vUE RPOUTER COMMAND
Cypress.Commands.add('mount', (component, options = {}) => {
  // Setup options object
  options.global = options.global || {}
  options.global.plugins = options.global.plugins || []

  // create router if one is not provided
  if (!options.router) {
    options.router = createRouter({
      routes: routes,
      history: createMemoryHistory(),
    })
  }

  // Add router plugin
  options.global.plugins.push({
    install(app) {
      app.use(options.router)
    },
  })

  return mount(component, options)
})


import Button from '../../src/components/Button.vue'

// 5. GLOBAL COMPONENT COMMAND
Cypress.Commands.add('mount', (component, options = {}) => {
  // Setup options object
  options.global = options.global || {}
  options.global.components = options.global.components || {}

  // Register global components
  options.global.components['Button'] = Button

  return mount(component, options)
})