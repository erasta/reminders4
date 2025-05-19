import { describe, it, expect } from '@jest/globals';

describe('Dummy Test Suite', () => {
  it('should always pass', () => {
    expect(true).toBe(true);
  });

  it('should handle basic math', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    expect('hello' + ' world').toBe('hello world');
  });
}); 