import WeekSelectionSummary from '@/components/staff/WeekSelectionSummary.vue'

describe('<WeekSelectionSummary />', () => {
  const mockItems = [
    {
      weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      selections: {},
      menuItems: [
        { id: 101, title: 'Jollof Rice' },
        { id: 102, title: 'Fried Rice' },
      ],
      isSubmitted: false,
      isSubmitting: false,
      isSavingDraft: false,
      isDeadlinePassed: false,
      isSubmittingAll: false,
    },
  ]

  it('Test for button disability depending on selected menu items', () => {
    cy.mount(WeekSelectionSummary, {
      props: {
        weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        selections: {
          '2026-08-24': null,
          '2026-08-25': null,
        },
        menuItems: [
          { id: 101, title: 'Jollof Rice' },
          { id: 102, title: 'Fried Rice' },
        ],
        isSubmitted: false,
        isSubmitting: false,
        isSavingDraft: false,
        isDeadlinePassed: false,
        isSubmittingAll: false,
      },
    })

    // Verify if the menu exists
    cy.contains('Your Order Actions').should('be.visible')
    cy.contains('button', 'Submit all selections').should('be.disabled')
    cy.contains('button', 'Save as Draft').should('be.disabled')
  })

  it('Test for button ability control', () => {
    cy.mount(WeekSelectionSummary, {
      props: {
        weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        selections: {
          '2026-08-24': 101,
          '2026-08-25': null,
        },
        menuItems: [
          { id: 101, title: 'Jollof Rice' },
          { id: 102, title: 'Fried Rice' },
        ],
        isSubmitted: false,
        isSubmitting: false,
        isSavingDraft: false,
        isDeadlinePassed: false,
        isSubmittingAll: false,
      },
    })

    // Verify if the menu exists
    cy.contains('Your Order Actions').should('be.visible')
    cy.contains('button', 'Submit all selections').should('be.enabled')
    cy.contains('button', 'Save as Draft').should('be.enabled')
  })

  it('Test for when a particular button is clicked i.e save-draft', () => {
    // Create a function that tracks the number of times it gets called
    const onSaveDraft = cy.spy().as('saveAsDraft')

    cy.mount(WeekSelectionSummary, {
      props: {
        weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        selections: {
          '2026-08-24': 101,
        },
        menuItems: [
          { id: 101, title: 'Jollof Rice' },
          { id: 102, title: 'Fried Rice' },
        ],
        isSubmitted: false,
        isSubmitting: false,
        isSavingDraft: false,
        isDeadlinePassed: false,
        isSubmittingAll: false,

        onSaveDraft,
      },
    })

    // Verify if the menu is selected
    cy.contains('button', 'Save as Draft').click()
    cy.get('@saveAsDraft').should('have.been.calledOnce')
  })

  it('Test for submit all selections button', () => {
    // Create a tracking function
    const onSubmit = cy.spy().as('saveAsSubmit')

    cy.mount(WeekSelectionSummary, {
      props: {
        weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        selections: {
          '2026-08-24': 101,
        },
        menuItems: [
          { id: 101, title: 'Jollof Rice' },
          { id: 102, title: 'Fried Rice' },
        ],
        isSubmitted: false,
        isSubmitting: false,
        isSavingDraft: false,
        isDeadlinePassed: false,
        isSubmittingAll: false,

        onSubmit,
      },
    })

    // Verify if the menu exists
    cy.contains('button', 'Submit all selections').click()
    cy.get('@saveAsSubmit').should('have.been.calledOnce')
  })

  it('Test when deadline is passed', () => {

    cy.mount(WeekSelectionSummary, {
      props: {
        weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        selections: {
          '2026-08-24': 101
        },
        menuItems: [
          { id: 101, title: 'Jollof Rice' },
          { id: 102, title: 'Fried Rice' },
        ],
        isSubmitted: false,
        isSubmitting: false,
        isSavingDraft: false,
        isDeadlinePassed: true,
        isSubmittingAll: false,

      },
    })

    // Verify if the menu exists
    cy.contains('Your Order Actions').should('be.visible')
    cy.contains('button', 'Submit all selections').should('be.disabled')
    cy.contains('button', 'Save as Draft').should('be.disabled')
  })

  it('Test when order is already submitted, disable buttons', () => {

    cy.mount(WeekSelectionSummary, {
      props: {
        weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        selections: {
          '2026-08-24': 101
        },
        menuItems: [
          { id: 101, title: 'Jollof Rice' },
          { id: 102, title: 'Fried Rice' },
        ],
        isSubmitted: true,
        isSubmitting: false,
        isSavingDraft: false,
        isDeadlinePassed: true,
        isSubmittingAll: false,

      },
    })

    // Verify if the menu exists
    cy.contains('Your Order Actions').should('be.visible')
    cy.contains('button', 'Submit all selections').should('be.disabled')
    cy.contains('button', 'Save as Draft').should('be.disabled')
  })

  it('Test for loading animation and disability when button is clicked', () => {

    cy.mount(WeekSelectionSummary, {
      props: {
        weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        selections: {
          '2026-08-24': 101
        },
        menuItems: [
          { id: 101, title: 'Jollof Rice' },
          { id: 102, title: 'Fried Rice' },
        ],
        isSubmitted: false,
        isSubmitting: false,
        isSavingDraft: true,
        isDeadlinePassed: false,
        isSubmittingAll: false,
      },
    })

    // Verify if the menu exists
    cy.contains('Your Order Actions').should('be.visible')
    cy.contains('button', 'Submit all selections').should('be.disabled')
    cy.contains('button', 'Save as Draft').should('be.disabled')
  })
})