// Web Worker pour exécuter le code utilisateur de manière isolée
self.onmessage = function(e) {
  const { code, tests } = e.data
  
  try {
    const TIMEOUT = 5000
    let isTimedOut = false
    
    // Créer un timeout qui force l'arrêt
    const timeoutId = setTimeout(() => {
      isTimedOut = true
      self.postMessage({
        success: false,
        error: 'Timeout: L\'exécution a été interrompue après 5 secondes (boucle infinie détectée?)',
        stack: ''
      })
      self.close()
    }, TIMEOUT)
    
    // Compteur pour vérifier le timeout
    let iterationCount = 0
    const MAX_ITERATIONS = 1000000
    
    const checkTimeout = () => {
      if (isTimedOut) {
        throw new Error('Timeout')
      }
      iterationCount++
      if (iterationCount > MAX_ITERATIONS) {
        throw new Error('Nombre maximum d\'itérations atteint (boucle infinie probable)')
      }
    }
    
    // Système de capture des résultats de tests
    const testResults = []
    let testCount = 0
    let passedCount = 0
    let failedCount = 0
    
    // Contexte d'exécution avec système de tests structuré
    const executionContext = {
      console: {
        log: (...args) => {
          // Capturer les logs comme messages informatifs
          testResults.push({
            type: 'log',
            message: args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ')
          })
        }
      },
      checkTimeout,
      // Fonction de test structurée
      test: (description, testFn) => {
        testCount++
        try {
          testFn()
          passedCount++
          testResults.push({
            type: 'pass',
            message: `✅ Test ${testCount}: ${description}`
          })
        } catch (error) {
          failedCount++
          testResults.push({
            type: 'fail',
            message: `❌ Test ${testCount}: ${description}`,
            error: error.message
          })
        }
      },
      // Assertions
      assert: (condition, message) => {
        if (!condition) {
          throw new Error(message || 'Assertion failed')
        }
      },
      assertEquals: (actual, expected, message) => {
        if (actual !== expected) {
          throw new Error(message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`)
        }
      },
      assertNotEquals: (actual, expected, message) => {
        if (actual === expected) {
          throw new Error(message || `Expected values to be different, but both are ${JSON.stringify(actual)}`)
        }
      },
      assertTrue: (condition, message) => {
        if (condition !== true) {
          throw new Error(message || `Expected true but got ${condition}`)
        }
      },
      assertFalse: (condition, message) => {
        if (condition !== false) {
          throw new Error(message || `Expected false but got ${condition}`)
        }
      }
    }
    
    // Instrumenter le code pour ajouter les vérifications de timeout
    const instrumentedCode = instrumentCodeWithTimeoutChecks(code)
    const instrumentedTests = instrumentCodeWithTimeoutChecks(tests)
    
    // Créer un environnement isolé qui exécute le code ET les tests ensemble
    const fullCode = `
      ${instrumentedCode}
      
      // Séparateur
      
      ${instrumentedTests}
      
      // Retourner un objet avec toutes les fonctions et variables définies
      return {
        // Capturer toutes les variables et fonctions du scope
        ...this
      }
    `
    
    // Exécuter le code dans un contexte isolé
    const executeCode = new Function(
      'console', 
      'checkTimeout', 
      'test',
      'assert', 
      'assertEquals',
      'assertNotEquals',
      'assertTrue',
      'assertFalse',
      `
        'use strict';
        ${fullCode}
      `
    )
    
    executeCode(
      executionContext.console,
      executionContext.checkTimeout,
      executionContext.test,
      executionContext.assert,
      executionContext.assertEquals,
      executionContext.assertNotEquals,
      executionContext.assertTrue,
      executionContext.assertFalse
    )
    
    clearTimeout(timeoutId)
    
    if (!isTimedOut) {
      // Formater les résultats
      const outputLines = []
      
      testResults.forEach(result => {
        if (result.type === 'pass') {
          outputLines.push(result.message)
        } else if (result.type === 'fail') {
          outputLines.push(result.message)
          if (result.error) {
            outputLines.push(`   ↳ ${result.error}`)
          }
        } else if (result.type === 'log') {
          outputLines.push(`ℹ️  ${result.message}`)
        }
      })
      
      // Ajouter un résumé si des tests ont été exécutés
      if (testCount > 0) {
        outputLines.push('')
        outputLines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        outputLines.push(`📊 Résumé: ${passedCount} réussi(s), ${failedCount} échoué(s) sur ${testCount} test(s)`)
        
        if (failedCount === 0) {
          outputLines.push('✨ Tous les tests sont passés avec succès !')
        }
      }
      
      const output = outputLines.length > 0
        ? outputLines.join('\n')
        : '✅ Code exécuté avec succès !\n\nUtilisez test() pour exécuter des tests.'
      
      self.postMessage({
        success: true,
        output: output,
        testCount,
        passedCount,
        failedCount
      })
    }
    
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}

// Fonction pour instrumenter le code avec des vérifications de timeout
function instrumentCodeWithTimeoutChecks(code) {
  let instrumented = code
  
  // Instrumenter les boucles while
  instrumented = instrumented.replace(
    /while\s*\([^)]+\)\s*\{/g, 
    match => match + '\ncheckTimeout();'
  )
  
  // Instrumenter les boucles for classiques
  instrumented = instrumented.replace(
    /for\s*\([^)]*;[^)]*;[^)]*\)\s*\{/g,
    match => match + '\ncheckTimeout();'
  )
  
  // Instrumenter les boucles for...of
  instrumented = instrumented.replace(
    /for\s*\([^)]+of[^)]+\)\s*\{/g,
    match => match + '\ncheckTimeout();'
  )
  
  // Instrumenter les boucles for...in
  instrumented = instrumented.replace(
    /for\s*\([^)]+in[^)]+\)\s*\{/g,
    match => match + '\ncheckTimeout();'
  )
  
  // Instrumenter les boucles do-while
  instrumented = instrumented.replace(
    /do\s*\{/g,
    match => match + '\ncheckTimeout();'
  )
  
  return instrumented
}