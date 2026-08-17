/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --

// CUSTOM CYPRESS LOGIN COMMAND FOR LOGIN CACHING
Cypress.Commands.add('HrLogin', (email = 'ericagornyrah@gmail.com', password = 'user123') => { 
    cy.session([email, password], () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:8000/staff/login',
            body: { email, password },
        }).then((response) => {
            expect(response.status).to.eq(200)

            const token = response.body['Staff Token'] || response.body.token
            const userInfo = response.body.userInfo

            window.sessionStorage.setItem('token', token)
            if(userInfo){
                window.sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
            }
        })
    })
})

Cypress.Commands.add('StaffLogin', (email = 'cypresstester@gmail.com', password = 'cypress123') => { 
    cy.session([email, password], () => {
        // 1. Make a request to the existing backend
        cy.request({
            method: 'POST',
            url: 'http://localhost:8000/staff/login',
            body: { email, password },
        }).then((response) => {
            expect(response.status).to.eq(200)
            const token = response.body['Staff Token'] || response.body.token
            window.sessionStorage.setItem('token', token)

            cy.request({
                method: 'GET',
                url: 'http://localhost:8000/staff/auth',
                headers: { Authorization: `Bearer ${token}` }
            }).then((authResponse) => {
                const profile = authResponse.body
                const userInfo = {
                    id: profile.staff_id || profile_id,
                    name: profile.name,
                    email: profile.email,
                    role: profile.role,
                    department: profile.department
                }
                window.sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
            })
        })
    })
})

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
