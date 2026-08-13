// ***********************************************************
// This example support/component.js is processed and
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
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import { VApp } from 'vuetify/components'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import 'vuetify/styles'

Cypress.Commands.add('mount', (component, options = {}) => {
    options.global = options.global || {}
    options.global.plugins = options.global.plugins || []

    const vuetify = createVuetify({ components, directives})
    const pinia = createPinia()

    // Dummy router for component isolation
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
        { path: '/login', component: { template: 'div' } },
        { path: '/hr', component: { template: 'div' } },
        { path: '/staff', component: { template: 'div' } },
        { path: '/forgot-password', component: { template: 'div' } },
        { path: '/register', component: { template: 'div' } },
        ],
    })

    options.global.plugins.push(vuetify)
    options.global.plugins.push(pinia)
    options.global.plugins.push(router)

    const wrapperComponent = {
        render () {
            return h(VApp, null, {
                default: () => h(component, options.props || {}),
            })
        },
    }

    return mount(wrapperComponent, options)
})

// Example use:
// cy.mount(MyComponent)