import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Skip all worker tests as Web Workers are not supported in jsdom environment
describe.skip('test-worker', () => {
  let worker: Worker
  
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (worker) {
      worker.terminate()
    }
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const createWorker = () => {
    return new Worker(new URL('../workers/test-worker.ts', import.meta.url), {
      type: 'module'
    })
  }

  const sendMessage = (worker: Worker, code: string, tests: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'))
      }, 10000)

      worker.onmessage = (e: MessageEvent) => {
        clearTimeout(timeout)
        resolve(e.data)
      }

      worker.onerror = (error: ErrorEvent) => {
        clearTimeout(timeout)
        reject(error)
      }

      worker.postMessage({ code, tests })
    })
  }

  describe('Exécution de code simple', () => {
    it('devrait exécuter du code simple sans tests', async () => {
      worker = createWorker()

      const code = 'const x = 42;'
      const tests = 'console.log("Test simple");'

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.output).toContain('Test simple')
    })

    it('devrait exécuter du code avec des calculs', async () => {
      worker = createWorker()

      const code = `
        function add(a, b) {
          return a + b;
        }
      `
      const tests = `
        const result = add(2, 3);
        console.log('Résultat:', result);
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.output).toContain('Résultat: 5')
    })
  })

  describe('Système de tests', () => {
    it('devrait exécuter un test qui passe', async () => {
      worker = createWorker()

      const code = `
        function multiply(a, b) {
          return a * b;
        }
      `
      const tests = `
        test('multiplication de 2 * 3', () => {
          assertEquals(multiply(2, 3), 6);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.testCount).toBe(1)
      expect(result.passedCount).toBe(1)
      expect(result.failedCount).toBe(0)
      expect(result.output).toContain('✅')
      expect(result.output).toContain('multiplication de 2 * 3')
    })

    it('devrait exécuter plusieurs tests', async () => {
      worker = createWorker()

      const code = `
        function add(a, b) {
          return a + b;
        }
        function subtract(a, b) {
          return a - b;
        }
      `
      const tests = `
        test('addition', () => {
          assertEquals(add(5, 3), 8);
        });
        
        test('soustraction', () => {
          assertEquals(subtract(10, 4), 6);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.testCount).toBe(2)
      expect(result.passedCount).toBe(2)
      expect(result.failedCount).toBe(0)
    })

    it('devrait détecter un test qui échoue', async () => {
      worker = createWorker()

      const code = `
        function buggyFunction() {
          return 42;
        }
      `
      const tests = `
        test('valeur incorrecte', () => {
          assertEquals(buggyFunction(), 100);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.testCount).toBe(1)
      expect(result.passedCount).toBe(0)
      expect(result.failedCount).toBe(1)
      expect(result.output).toContain('❌')
    })

    it('devrait gérer des tests mixtes (succès et échecs)', async () => {
      worker = createWorker()

      const code = `
        function isEven(n) {
          return n % 2 === 0;
        }
      `
      const tests = `
        test('2 est pair', () => {
          assertTrue(isEven(2));
        });
        
        test('3 est pair (faux)', () => {
          assertTrue(isEven(3));
        });
        
        test('4 est pair', () => {
          assertTrue(isEven(4));
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.testCount).toBe(3)
      expect(result.passedCount).toBe(2)
      expect(result.failedCount).toBe(1)
    })
  })

  describe('Assertions', () => {
    it('devrait valider assert', async () => {
      worker = createWorker()

      const code = 'const value = true;'
      const tests = `
        test('assert true', () => {
          assert(value);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.passedCount).toBe(1)
    })

    it('devrait valider assertEquals', async () => {
      worker = createWorker()

      const code = 'const x = 10;'
      const tests = `
        test('x égal à 10', () => {
          assertEquals(x, 10);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.passedCount).toBe(1)
    })

    it('devrait valider assertNotEquals', async () => {
      worker = createWorker()

      const code = 'const y = 5;'
      const tests = `
        test('y différent de 10', () => {
          assertNotEquals(y, 10);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.passedCount).toBe(1)
    })

    it('devrait valider assertTrue', async () => {
      worker = createWorker()

      const code = 'const isValid = true;'
      const tests = `
        test('isValid est vrai', () => {
          assertTrue(isValid);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.passedCount).toBe(1)
    })

    it('devrait valider assertFalse', async () => {
      worker = createWorker()

      const code = 'const isInvalid = false;'
      const tests = `
        test('isInvalid est faux', () => {
          assertFalse(isInvalid);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.passedCount).toBe(1)
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de syntaxe', async () => {
      worker = createWorker()

      const code = 'const x = ;' // Erreur de syntaxe
      const tests = 'console.log(x);'

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('devrait gérer les erreurs d\'exécution', async () => {
      worker = createWorker()

      const code = `
        function divide(a, b) {
          if (b === 0) throw new Error('Division par zéro');
          return a / b;
        }
      `
      const tests = `
        test('division par zéro', () => {
          divide(10, 0);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.failedCount).toBe(1)
      expect(result.output).toContain('Division par zéro')
    })

    it('devrait gérer les références indéfinies', async () => {
      worker = createWorker()

      const code = 'const a = 1;'
      const tests = `
        test('variable inexistante', () => {
          console.log(variableInexistante);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.failedCount).toBe(1)
    })
  })

  describe('Console.log', () => {
    it('devrait capturer les logs simples', async () => {
      worker = createWorker()

      const code = ''
      const tests = 'console.log("Hello World");'

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.output).toContain('Hello World')
      expect(result.output).toContain('ℹ️')
    })

    it('devrait capturer plusieurs logs', async () => {
      worker = createWorker()

      const code = ''
      const tests = `
        console.log("Premier log");
        console.log("Deuxième log");
        console.log("Troisième log");
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.output).toContain('Premier log')
      expect(result.output).toContain('Deuxième log')
      expect(result.output).toContain('Troisième log')
    })

    it('devrait formater les objets JSON', async () => {
      worker = createWorker()

      const code = ''
      const tests = `
        const obj = { name: 'Test', value: 42 };
        console.log(obj);
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.output).toContain('name')
      expect(result.output).toContain('Test')
      expect(result.output).toContain('value')
      expect(result.output).toContain('42')
    })

    it('devrait gérer null et undefined', async () => {
      worker = createWorker()

      const code = ''
      const tests = `
        console.log(null);
        console.log(undefined);
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.output).toContain('null')
      expect(result.output).toContain('undefined')
    })
  })

  describe('Timeout et boucles infinies', () => {
    it('devrait détecter une boucle while infinie', async () => {
      worker = createWorker()

      const code = `
        function infiniteLoop() {
          while(true) {
            // Boucle infinie
          }
        }
      `
      const tests = 'infiniteLoop();'

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toMatch(/Timeout|itérations|infinie/i)
    }, 15000)

    it('devrait détecter une boucle for infinie', async () => {
      worker = createWorker()

      const code = `
        function infiniteFor() {
          for(let i = 0; i >= 0; i++) {
            // Boucle infinie
          }
        }
      `
      const tests = 'infiniteFor();'

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    }, 15000)

    it('devrait permettre des boucles normales', async () => {
      worker = createWorker()

      const code = `
        function normalLoop() {
          let sum = 0;
          for(let i = 0; i < 100; i++) {
            sum += i;
          }
          return sum;
        }
      `
      const tests = `
        test('boucle normale', () => {
          const result = normalLoop();
          assertEquals(result, 4950);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.passedCount).toBe(1)
    })
  })

  describe('Intégration code et tests', () => {
    it('devrait permettre aux tests d\'accéder au code', async () => {
      worker = createWorker()

      const code = `
        class Calculator {
          add(a, b) {
            return a + b;
          }
          
          multiply(a, b) {
            return a * b;
          }
        }
        
        const calc = new Calculator();
      `
      const tests = `
        test('addition', () => {
          assertEquals(calc.add(3, 4), 7);
        });
        
        test('multiplication', () => {
          assertEquals(calc.multiply(3, 4), 12);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.testCount).toBe(2)
      expect(result.passedCount).toBe(2)
    })

    it('devrait permettre des fonctions complexes', async () => {
      worker = createWorker()

      const code = `
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
      `
      const tests = `
        test('fibonacci de 0', () => {
          assertEquals(fibonacci(0), 0);
        });
        
        test('fibonacci de 1', () => {
          assertEquals(fibonacci(1), 1);
        });
        
        test('fibonacci de 6', () => {
          assertEquals(fibonacci(6), 8);
        });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.testCount).toBe(3)
      expect(result.passedCount).toBe(3)
    })
  })

  describe('Résumé des tests', () => {
    it('devrait afficher un résumé avec tous les tests réussis', async () => {
      worker = createWorker()

      const code = 'const x = 10;'
      const tests = `
        test('test 1', () => { assertEquals(x, 10); });
        test('test 2', () => { assertTrue(true); });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.output).toContain('Résumé')
      expect(result.output).toContain('2 réussi(s)')
      expect(result.output).toContain('0 échoué(s)')
      expect(result.output).toContain('Tous les tests sont passés avec succès')
    })

    it('devrait afficher un résumé avec des échecs', async () => {
      worker = createWorker()

      const code = 'const x = 10;'
      const tests = `
        test('test réussi', () => { assertEquals(x, 10); });
        test('test échoué', () => { assertEquals(x, 20); });
      `

      const result = await sendMessage(worker, code, tests)

      expect(result.success).toBe(true)
      expect(result.output).toContain('Résumé')
      expect(result.output).toContain('1 réussi(s)')
      expect(result.output).toContain('1 échoué(s)')
      expect(result.output).not.toContain('Tous les tests sont passés')
    })
  })
})
