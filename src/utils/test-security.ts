/**
 * Test utility to verify GitHub Actions security workflow
 * This is a harmless test file that should trigger our workflows
 */
export const add = (a: number, b: number): number => {
  return a + b;
}

// This is a test comment to trigger the workflow
export const multiply = (a: number, b: number): number => {
  return a * b;
} 