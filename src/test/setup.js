import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Setup DOM environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.URL.createObjectURL and revokeObjectURL for file download tests
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock document.createElement for download tests
const mockLink = {
  click: vi.fn(),
  setAttribute: vi.fn(),
  style: {},
}

const originalCreateElement = document.createElement
document.createElement = vi.fn((tagName) => {
  if (tagName === 'a') {
    return mockLink
  }
  return originalCreateElement.call(document, tagName)
})

// Mock document.body methods
document.body.appendChild = vi.fn()
document.body.removeChild = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}