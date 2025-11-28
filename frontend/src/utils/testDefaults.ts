export const defaultCode = `// Définir vos fonctions ici
function add(a, b) {
  return a + b
}

function multiply(a, b) {
  return a * b
}

function greet(name) {
  return "Hello, " + name + "!"
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Division par zéro")
  }
  return a / b
}`

export const defaultTests = `// Écrire vos tests avec la fonction test()
// Syntaxe: test("description", () => { /* assertions */ })

test("add(2, 3) devrait retourner 5", () => {
  assertEquals(add(2, 3), 5)
})

test("add(-1, 1) devrait retourner 0", () => {
  assertEquals(add(-1, 1), 0)
})

test("multiply(3, 4) devrait retourner 12", () => {
  assertEquals(multiply(3, 4), 12)
})

test("multiply(0, 100) devrait retourner 0", () => {
  assertEquals(multiply(0, 100), 0)
})

test("greet('Alice') devrait retourner 'Hello, Alice!'", () => {
  assertEquals(greet("Alice"), "Hello, Alice!")
})

test("greet('Bob') ne devrait pas retourner 'Hello, Alice!'", () => {
  assertNotEquals(greet("Bob"), "Hello, Alice!")
})

test("divide(10, 2) devrait retourner 5", () => {
  assertEquals(divide(10, 2), 5)
})

test("divide par zéro devrait lever une erreur", () => {
  try {
    divide(10, 0)
    assert(false, "Une erreur aurait dû être levée")
  } catch(e) {
    assert(e.message === "Division par zéro", "Le message d'erreur est correct")
  }
})

test("le résultat de add devrait être un nombre", () => {
  assertTrue(typeof add(1, 1) === "number")
})

test("add(5, 3) ne devrait pas retourner 7", () => {
  assertNotEquals(add(5, 3), 7)
})

// Vous pouvez aussi utiliser console.log() pour afficher des infos
console.log("Tous les tests ont été exécutés !")`
