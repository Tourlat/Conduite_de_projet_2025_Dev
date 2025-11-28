import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeEditor from '../../testView/CodeEditor.vue'

describe('CodeEditor', () => {
  it('devrait afficher le titre correctement', () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: '',
        title: 'Code JavaScript',
        placeholder: 'Écrivez votre code ici...'
      }
    })

    expect(wrapper.text()).toContain('Code JavaScript')
  })

  it('devrait afficher le placeholder dans le textarea', () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: '',
        title: 'Tests',
        placeholder: 'Écrivez vos tests ici...'
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toBe('Écrivez vos tests ici...')
  })

  it('devrait afficher la valeur du modelValue dans le textarea', () => {
    const codeContent = 'function hello() { return "world"; }'
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: codeContent,
        title: 'Code',
        placeholder: 'Code...'
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.element.value).toBe(codeContent)
  })

  it('devrait émettre update:modelValue lors de la saisie dans le textarea', async () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: '',
        title: 'Code',
        placeholder: 'Code...'
      }
    })

    const textarea = wrapper.find('textarea')
    const newValue = 'const x = 42;'
    
    await textarea.setValue(newValue)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([newValue])
  })

  it('devrait émettre reset lors du clic sur le bouton Réinitialiser', async () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: 'some code',
        title: 'Code',
        placeholder: 'Code...'
      }
    })

    const resetButton = wrapper.find('.btn-reset')
    expect(resetButton.exists()).toBe(true)

    await resetButton.trigger('click')

    expect(wrapper.emitted('reset')).toBeTruthy()
    expect(wrapper.emitted('reset')?.length).toBe(1)
  })

  it('devrait avoir un textarea avec la classe code-editor', () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: '',
        title: 'Code',
        placeholder: 'Code...'
      }
    })

    const textarea = wrapper.find('.code-editor')
    expect(textarea.exists()).toBe(true)
    expect(textarea.element.tagName).toBe('TEXTAREA')
  })

  it('devrait avoir spellcheck désactivé sur le textarea', () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: '',
        title: 'Code',
        placeholder: 'Code...'
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('spellcheck')).toBe('false')
  })

  it('devrait contenir un en-tête de section avec le titre et le bouton', () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: '',
        title: 'Mon Éditeur',
        placeholder: 'Code...'
      }
    })

    const header = wrapper.find('.section-header')
    expect(header.exists()).toBe(true)
    expect(header.text()).toContain('Mon Éditeur')
    expect(header.find('.btn-reset').exists()).toBe(true)
  })

  it('devrait afficher le bouton Réinitialiser avec le bon texte', () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: '',
        title: 'Code',
        placeholder: 'Code...'
      }
    })

    const resetButton = wrapper.find('.btn-reset')
    expect(resetButton.text()).toBe('Réinitialiser')
  })

  it('devrait mettre à jour la valeur plusieurs fois correctement', async () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: 'initial',
        title: 'Code',
        placeholder: 'Code...'
      }
    })

    const textarea = wrapper.find('textarea')
    
    await textarea.setValue('first update')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['first update'])

    await textarea.setValue('second update')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['second update'])

    await textarea.setValue('third update')
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual(['third update'])
  })
})
