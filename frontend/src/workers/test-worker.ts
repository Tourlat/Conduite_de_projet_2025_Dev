interface TestResultItem {
  type: 'pass' | 'fail' | 'log'
  message: string
  error?: string
}

interface WorkerMessage {
  code: string
  tests: string
}

interface WorkerResponse {
  success: boolean
  output?: string
  error?: string
  stack?: string
  testCount?: number
  passedCount?: number
  failedCount?: number
}

/**
 * Global message handler for the web worker.
 * @param e the message event containing the user code and tests
 */
globalThis.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { code, tests } = e.data
  
  try {
    const TIMEOUT = 5000
    let isTimedOut = false
    
    // Create a timeout that forces termination
    const timeoutId = setTimeout(() => {
      isTimedOut = true
      const response: WorkerResponse = {
        success: false,
        error: 'Timeout: Execution was interrupted after 5 seconds (infinite loop detected?)',
        stack: ''
      }
      globalThis.postMessage(response)
      globalThis.close()
    }, TIMEOUT)
    
    // Counter to check the timeout
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
    
    // Test results capture system
    const testResults: TestResultItem[] = []
    let testCount = 0
    let passedCount = 0
    let failedCount = 0
    
    // Execution context with structured test system
    const executionContext = {
      console: {
        log: (...args: unknown[]) => {
          // Capture logs as informational messages
          testResults.push({
            type: 'log',
            message: args.map(arg => {
              if (arg === null || arg === undefined) return String(arg)
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2)
                } catch {
                  return String(arg)
                }
              }
              return String(arg)
            }).join(' ')
          })
        }
      },
      checkTimeout,
      // Structured test function
      test: (description: string, testFn: () => void) => {
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
            error: error instanceof Error ? error.message : String(error)
          })
        }
      },
      // Assertions
      assert: (condition: unknown, message?: string) => {
        if (!condition) {
          throw new Error(message || 'Assertion failed')
        }
      },
      assertEquals: (actual: unknown, expected: unknown, message?: string) => {
        if (actual !== expected) {
          throw new Error(message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`)
        }
      },
      assertNotEquals: (actual: unknown, expected: unknown, message?: string) => {
        if (actual === expected) {
          throw new Error(message || `Expected values to be different, but both are ${JSON.stringify(actual)}`)
        }
      },
      assertTrue: (condition: unknown, message?: string) => {
        if (condition !== true) {
          throw new Error(message || `Expected true but got ${condition}`)
        }
      },
      assertFalse: (condition: unknown, message?: string) => {
        if (condition !== false) {
          throw new Error(message || `Expected false but got ${condition}`)
        }
      }
    }
    
    // Add timeout checks to the user code and tests
    const instrumentedCode = instrumentCodeWithTimeoutChecks(code)
    const instrumentedTests = instrumentCodeWithTimeoutChecks(tests)
    
    // Create an isolated environment that runs the code AND tests together
    const fullCode = `
      ${instrumentedCode}
      
      // SSeparator
      
      ${instrumentedTests}
    `
    
    // Execute the code in an isolated context
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
      // Format the output
      const outputLines: string[] = []
      
      for (const result of testResults) {
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
      }
      
      // Add a summary if tests were run
      if (testCount > 0) {
        outputLines.push(
          '',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          `📊 Résumé: ${passedCount} réussi(s), ${failedCount} échoué(s) sur ${testCount} test(s)`
        )
        
        if (failedCount === 0) {
          outputLines.push('✨ Tous les tests sont passés avec succès !')
        }
      }
      
      const output = outputLines.length > 0
        ? outputLines.join('\n')
        : '✅ Code exécuté avec succès !\n\nUtilisez test() pour exécuter des tests.'
      
      const response: WorkerResponse = {
        success: true,
        output: output,
        testCount,
        passedCount,
        failedCount
      }
      globalThis.postMessage(response)
    }
    
  } catch (error) {
    const response: WorkerResponse = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }
    globalThis.postMessage(response)
  }
}

/**
 * Add timeout checks inside loops to prevent infinite loops.
 * @param code the user code to instrument
 * @returns the instrumented code with timeout checks
 */
function instrumentCodeWithTimeoutChecks(code: string): string {
  let instrumented = code
  
  // Instrument while loops
  instrumented = instrumented.replace(
    /while\s*\([^)]+\)\s*\{/g, 
    (match: string) => match + '\ncheckTimeout();'
  )
  
  // Instrument classic for loops
  instrumented = instrumented.replace(
    /for\s*\([^)]*;[^)]*;[^)]*\)\s*\{/g,
    (match: string) => match + '\ncheckTimeout();'
  )
  
  // Instrument for...of loops
  instrumented = instrumented.replace(
    /for\s*\([^)]+of[^)]+\)\s*\{/g,
    (match: string) => match + '\ncheckTimeout();'
  )
  
  // Instrument for...in loops
  instrumented = instrumented.replace(
    /for\s*\([^)]+in[^)]+\)\s*\{/g,
    (match: string) => match + '\ncheckTimeout();'
  )
  
  // Instrument do-while loops
  instrumented = instrumented.replace(
    /do\s*\{/g,
    (match: string) => match + '\ncheckTimeout();'
  )
  
  return instrumented
}
