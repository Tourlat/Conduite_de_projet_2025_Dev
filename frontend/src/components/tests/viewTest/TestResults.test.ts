import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TestResults from '../../testView/TestResults.vue'

type TestResult = {
  success: boolean
  output?: string
  error?: string
}

describe('TestResults', () => {
  it('ne devrait rien afficher si result est null', () => {
    const wrapper = mount(TestResults, {
      props: {
        result: null
      }
    })

    expect(wrapper.find('.results-section').exists()).toBe(false)
  })

  it('devrait afficher la section des résultats si result est fourni', () => {
    const result: TestResult = {
      success: true,
      output: 'All tests passed!'
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    expect(wrapper.find('.results-section').exists()).toBe(true)
  })

  it('devrait afficher le titre "Résultats"', () => {
    const result: TestResult = {
      success: true,
      output: 'Test output'
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    expect(wrapper.text()).toContain('Résultats')
    expect(wrapper.find('h3').text()).toBe('Résultats')
  })

  it('devrait afficher le contenu de output pour un test réussi', () => {
    const output = '✓ Test 1 passed\n✓ Test 2 passed\n✓ All tests passed!'
    const result: TestResult = {
      success: true,
      output
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    const pre = wrapper.find('pre')
    expect(pre.exists()).toBe(true)
    expect(pre.text()).toBe(output)
  })

  it('devrait afficher le message d\'erreur pour un test échoué', () => {
    const errorMessage = 'ReferenceError: x is not defined'
    const result: TestResult = {
      success: false,
      error: errorMessage
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    const pre = wrapper.find('pre.error-message')
    expect(pre.exists()).toBe(true)
    expect(pre.text()).toBe(errorMessage)
  })

  it('devrait avoir la classe "success" pour un test réussi', () => {
    const result: TestResult = {
      success: true,
      output: 'Tests passed'
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    const resultsContent = wrapper.find('.results-content')
    expect(resultsContent.classes()).toContain('success')
  })

  it('devrait avoir la classe "error" pour un test échoué', () => {
    const result: TestResult = {
      success: false,
      error: 'Test failed'
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    const resultsContent = wrapper.find('.results-content')
    expect(resultsContent.classes()).toContain('error')
  })

  it('devrait afficher un long message d\'erreur avec stack trace', () => {
    const errorWithStack = `TypeError: Cannot read property 'x' of undefined
    
Stack:
at testFunction (code.js:10:15)
at Object.test (tests.js:5:3)
at runTests (runner.js:20:5)`

    const result: TestResult = {
      success: false,
      error: errorWithStack
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    expect(wrapper.find('pre').text()).toContain('TypeError')
    expect(wrapper.find('pre').text()).toContain('Stack:')
    expect(wrapper.find('pre').text()).toContain('at testFunction')
  })

  it('devrait mettre à jour l\'affichage quand result change', async () => {
    const wrapper = mount(TestResults, {
      props: {
        result: null
      }
    })

    expect(wrapper.find('.results-section').exists()).toBe(false)

    await wrapper.setProps({
      result: {
        success: true,
        output: 'New result'
      }
    })

    expect(wrapper.find('.results-section').exists()).toBe(true)
    expect(wrapper.find('pre').text()).toBe('New result')
  })

  it('devrait passer de success à error correctement', async () => {
    const wrapper = mount(TestResults, {
      props: {
        result: {
          success: true,
          output: 'All good'
        }
      }
    })

    expect(wrapper.find('.results-content').classes()).toContain('success')
    expect(wrapper.find('pre').text()).toBe('All good')

    await wrapper.setProps({
      result: {
        success: false,
        error: 'Something broke'
      }
    })

    expect(wrapper.find('.results-content').classes()).toContain('error')
    expect(wrapper.find('.results-content').classes()).not.toContain('success')
    expect(wrapper.find('pre').text()).toBe('Something broke')
  })

  it('devrait avoir un pre avec style pre-wrap pour le contenu', () => {
    const result: TestResult = {
      success: true,
      output: 'Test output with very long line that should wrap properly without breaking the layout'
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    const pre = wrapper.find('pre')
    expect(pre.exists()).toBe(true)
  })

  it('devrait afficher des résultats vides si output est une chaîne vide', () => {
    const result: TestResult = {
      success: true,
      output: ''
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    expect(wrapper.find('.results-section').exists()).toBe(true)
    expect(wrapper.find('pre').text()).toBe('')
  })

  it('devrait afficher une erreur vide si error est une chaîne vide', () => {
    const result: TestResult = {
      success: false,
      error: ''
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    expect(wrapper.find('.results-section').exists()).toBe(true)
    expect(wrapper.find('pre.error-message').text()).toBe('')
  })

  it('devrait contenir la structure HTML correcte', () => {
    const result: TestResult = {
      success: true,
      output: 'Test passed'
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    expect(wrapper.find('.results-section').exists()).toBe(true)
    expect(wrapper.find('.results-section h3').exists()).toBe(true)
    expect(wrapper.find('.results-content').exists()).toBe(true)
    expect(wrapper.find('.results-content pre').exists()).toBe(true)
  })

  it('devrait gérer les résultats avec des caractères spéciaux', () => {
    const specialOutput = 'Test ✓ ✗ → ← ≈ ≠ © ® ™ <script>alert("xss")</script>'
    const result: TestResult = {
      success: true,
      output: specialOutput
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    expect(wrapper.find('pre').text()).toBe(specialOutput)
  })

  it('devrait gérer les sauts de ligne multiples', () => {
    const multilineOutput = `Test 1: Pass
Test 2: Pass

Test 3: Pass
    
Test 4: Pass`

    const result: TestResult = {
      success: true,
      output: multilineOutput
    }

    const wrapper = mount(TestResults, {
      props: {
        result
      }
    })

    expect(wrapper.find('pre').text()).toBe(multilineOutput)
  })
})
