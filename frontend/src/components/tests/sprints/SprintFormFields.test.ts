import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SprintFormFields from '../../sprints/SprintFormFields.vue'

describe('SprintFormFields', () => {
  it('devrait afficher les champs du formulaire', () => {
    const wrapper = mount(SprintFormFields, {
      props: {
        name: '',
        startDate: '',
        endDate: ''
      }
    })
    
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.findAll('input[type="datetime-local"]')).toHaveLength(2)
  })

  it('devrait afficher le nom du sprint', () => {
    const wrapper = mount(SprintFormFields, {
      props: {
        name: 'Sprint Test',
        startDate: '',
        endDate: ''
      }
    })
    
    const nameInput = wrapper.find('input[type="text"]')
    expect((nameInput.element as HTMLInputElement).value).toBe('Sprint Test')
  })

  it('devrait émettre update:name lors de la saisie du nom', async () => {
    const wrapper = mount(SprintFormFields, {
      props: {
        name: '',
        startDate: '',
        endDate: ''
      }
    })
    
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Nouveau Sprint')
    
    expect(wrapper.emitted('update:name')).toBeTruthy()
    expect(wrapper.emitted('update:name')?.[0]).toEqual(['Nouveau Sprint'])
  })

  it('devrait émettre update:startDate lors de la modification de la date de début', async () => {
    const wrapper = mount(SprintFormFields, {
      props: {
        name: '',
        startDate: '',
        endDate: ''
      }
    })
    
    const startDateInput = wrapper.findAll('input[type="datetime-local"]')[0]
    if (startDateInput) {
      await startDateInput.setValue('2025-11-01T10:00')
    }
    
    expect(wrapper.emitted('update:startDate')).toBeTruthy()
    expect(wrapper.emitted('update:startDate')?.[0]).toEqual(['2025-11-01T10:00'])
  })

  it('devrait émettre update:endDate lors de la modification de la date de fin', async () => {
    const wrapper = mount(SprintFormFields, {
      props: {
        name: '',
        startDate: '',
        endDate: ''
      }
    })
    
    const endDateInput = wrapper.findAll('input[type="datetime-local"]')[1]
    if (endDateInput) {
      await endDateInput.setValue('2025-11-15T10:00')
    }
    
    expect(wrapper.emitted('update:endDate')).toBeTruthy()
    expect(wrapper.emitted('update:endDate')?.[0]).toEqual(['2025-11-15T10:00'])
  })

  it('devrait afficher les labels obligatoires', () => {
    const wrapper = mount(SprintFormFields, {
      props: {
        name: '',
        startDate: '',
        endDate: ''
      }
    })
    
    expect(wrapper.text()).toContain('Nom du sprint')
    expect(wrapper.text()).toContain('Date de début')
    expect(wrapper.text()).toContain('Date de fin')
  })

  it('devrait avoir la classe form-row pour les dates', () => {
    const wrapper = mount(SprintFormFields, {
      props: {
        name: '',
        startDate: '',
        endDate: ''
      }
    })
    
    expect(wrapper.find('.form-row').exists()).toBe(true)
  })
})
