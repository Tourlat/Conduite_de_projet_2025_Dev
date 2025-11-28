export interface TestResult {
  success: boolean
  output?: string
  error?: string
  testCount?: number
  passedCount?: number
  failedCount?: number
}

export interface WorkerMessage {
  code: string
  tests: string
}

export interface WorkerResponse {
  success: boolean
  output?: string
  error?: string
  stack?: string
  testCount?: number
  passedCount?: number
  failedCount?: number
}
