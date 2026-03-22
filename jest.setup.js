// Jest setup file for global test configuration

// Use fake-indexeddb for testing
require('fake-indexeddb/auto');

// Import testing library matchers
require('@testing-library/jest-dom');

// Polyfill for structuredClone (not available in Node.js 18)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
