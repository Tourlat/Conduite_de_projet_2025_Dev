import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import FileUploadSection from '../../testView/FileUploadSection.vue'

describe('FileUploadSection', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(FileUploadSection)
  })

  describe('Rendu du composant', () => {
    it('devrait afficher le label pour le chargement de code', () => {
      const label = wrapper.find('label[for="code-file-upload"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Charger un fichier de code (.js, .txt)')
    })

    it('devrait afficher le label pour le chargement de tests', () => {
      const label = wrapper.find('label[for="test-file-upload"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Charger un fichier de tests (.js, .txt)')
    })

    it('devrait afficher le bouton de téléchargement', () => {
      const button = wrapper.find('.btn-download')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Télécharger les fichiers')
    })

    it('devrait avoir un input de type file pour le code', () => {
      const input = wrapper.find('#code-file-upload')
      expect(input.exists()).toBe(true)
      expect(input.attributes('type')).toBe('file')
      expect(input.attributes('accept')).toBe('.js,.txt,.mjs')
    })

    it('devrait avoir un input de type file pour les tests', () => {
      const input = wrapper.find('#test-file-upload')
      expect(input.exists()).toBe(true)
      expect(input.attributes('type')).toBe('file')
      expect(input.attributes('accept')).toBe('.js,.txt,.mjs')
    })

    it('devrait cacher visuellement les inputs de type file', () => {
      const codeInput = wrapper.find('#code-file-upload')
      const testInput = wrapper.find('#test-file-upload')
      
      expect(codeInput.classes()).toContain('file-input')
      expect(testInput.classes()).toContain('file-input')
    })
  })

  describe('Chargement de fichier de code', () => {
    it('devrait émettre uploadCode avec le contenu du fichier', async () => {
      const content = 'function test() { return 42; }'
      const file = new File([content], 'code.js', { type: 'text/javascript' })
      
      const input = wrapper.find('#code-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: [file]
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadCode')).toBeTruthy()
      expect(wrapper.emitted('uploadCode')?.[0]).toEqual([content])
    })

    it('devrait gérer les fichiers .txt pour le code', async () => {
      const content = 'const x = 1;'
      const file = new File([content], 'code.txt', { type: 'text/plain' })

      const input = wrapper.find('#code-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: [file]
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadCode')?.[0]).toEqual([content])
    })

    it('devrait gérer les fichiers .mjs pour le code', async () => {
      const content = 'export const test = 1;'
      const file = new File([content], 'code.mjs', { type: 'text/javascript' })

      const input = wrapper.find('#code-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: [file]
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadCode')?.[0]).toEqual([content])
    })

    it('devrait réinitialiser l\'input après le chargement', async () => {
      const content = 'const x = 1;'
      const file = new File([content], 'code.js', { type: 'text/javascript' })

      const input = wrapper.find('#code-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: [file]
      })

      await input.trigger('change')
      await flushPromises()

      expect(el.value).toBe('')
    })
  })

  describe('Chargement de fichier de tests', () => {
    it('devrait émettre uploadTests avec le contenu du fichier', async () => {
      const content = 'test("should work", () => { assert(true); })'
      const file = new File([content], 'test.js', { type: 'text/javascript' })

      const input = wrapper.find('#test-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: [file]
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadTests')).toBeTruthy()
      expect(wrapper.emitted('uploadTests')?.[0]).toEqual([content])
    })

    it('devrait gérer les fichiers .txt pour les tests', async () => {
      const content = 'test content'
      const file = new File([content], 'test.txt', { type: 'text/plain' })

      const input = wrapper.find('#test-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: [file]
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadTests')?.[0]).toEqual([content])
    })

    it('devrait réinitialiser l\'input après le chargement', async () => {
      const content = 'test content'
      const file = new File([content], 'test.js', { type: 'text/javascript' })

      const input = wrapper.find('#test-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: [file]
      })

      await input.trigger('change')
      await flushPromises()

      expect(el.value).toBe('')
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait afficher une alerte en cas d\'erreur de lecture du fichier de code', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const input = wrapper.find('#code-file-upload')
      const el = input.element as HTMLInputElement

      const errorFile = {
        text: vi.fn().mockRejectedValue(new Error('Read error'))
      }

      Object.defineProperty(el, 'files', {
        value: [errorFile]
      })

      await input.trigger('change')
      await flushPromises()

      expect(alertSpy).toHaveBeenCalledWith('Erreur lors de la lecture du fichier')
      expect(wrapper.emitted('uploadCode')).toBeFalsy()

      alertSpy.mockRestore()
    })

    it('devrait afficher une alerte en cas d\'erreur de lecture du fichier de tests', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const input = wrapper.find('#test-file-upload')
      const el = input.element as HTMLInputElement

      const errorFile = {
        text: vi.fn().mockRejectedValue(new Error('Read error'))
      }

      Object.defineProperty(el, 'files', {
        value: [errorFile]
      })

      await input.trigger('change')
      await flushPromises()

      expect(alertSpy).toHaveBeenCalledWith('Erreur lors de la lecture du fichier')
      expect(wrapper.emitted('uploadTests')).toBeFalsy()

      alertSpy.mockRestore()
    })

    it('ne devrait rien faire si aucun fichier n\'est sélectionné pour le code', async () => {
      const input = wrapper.find('#code-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: []
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadCode')).toBeFalsy()
    })

    it('ne devrait rien faire si aucun fichier n\'est sélectionné pour les tests', async () => {
      const input = wrapper.find('#test-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: []
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadTests')).toBeFalsy()
    })
  })

  describe('Bouton de téléchargement', () => {
    it('devrait émettre download lors du clic', async () => {
      const button = wrapper.find('.btn-download')

      await button.trigger('click')

      expect(wrapper.emitted('download')).toBeTruthy()
      expect(wrapper.emitted('download')?.length).toBe(1)
    })

    it('devrait émettre download plusieurs fois lors de clics multiples', async () => {
      const button = wrapper.find('.btn-download')

      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')

      expect(wrapper.emitted('download')?.length).toBe(3)
    })
  })

  describe('Intégration', () => {
    it('devrait pouvoir charger un fichier de code puis un fichier de tests', async () => {
      const codeContent = 'function add(a, b) { return a + b; }'
      const testContent = 'test("add", () => { assert(add(1, 2) === 3); })'

      const codeFile = new File([codeContent], 'code.js', { type: 'text/javascript' })
      const testFile = new File([testContent], 'test.js', { type: 'text/javascript' })

      const codeInput = wrapper.find('#code-file-upload')
      const codeEl = codeInput.element as HTMLInputElement

      Object.defineProperty(codeEl, 'files', {
        value: [codeFile]
      })

      await codeInput.trigger('change')
      await flushPromises()

      const testInput = wrapper.find('#test-file-upload')
      const testEl = testInput.element as HTMLInputElement

      Object.defineProperty(testEl, 'files', {
        value: [testFile]
      })

      await testInput.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadCode')?.[0]).toEqual([codeContent])
      expect(wrapper.emitted('uploadTests')?.[0]).toEqual([testContent])
    })

    it('devrait permettre de charger le même fichier plusieurs fois après réinitialisation', async () => {
      const content = 'const x = 1;'
      const file1 = new File([content], 'code.js', { type: 'text/javascript' })
      const file2 = new File([content], 'code.js', { type: 'text/javascript' })

      const input = wrapper.find('#code-file-upload')
      const el = input.element as HTMLInputElement

      Object.defineProperty(el, 'files', {
        value: [file1]
      })

      await input.trigger('change')
      await flushPromises()

      expect(el.value).toBe('')

      Object.defineProperty(el, 'files', {
        value: [file2]
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.emitted('uploadCode')?.length).toBe(2)
    })
  })
})
