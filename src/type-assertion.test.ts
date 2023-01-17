import { it, describe, expect } from 'vitest';

import { assertExhaustive, assertIsPackageManagerString } from './type-assertion.js';

describe('assertIsPackageManagerString()', () => {
  it('Throws when input is not valid', () => {
    expect(() => {
      assertIsPackageManagerString('npm@9.2.0');
    }).not.toThrow();

    expect(() => {
      assertIsPackageManagerString('bad input');
    }).toThrow();
  });
});

describe('assertExhaustive()', () => {
  it('Always throws', () => {
    expect(() => {
      assertExhaustive('test' as never);
    }).toThrow();

    expect(() => {
      assertExhaustive('test' as never, 'test');
    }).toThrow();

    expect(() => {
      assertExhaustive('test' as never, new Error('test'));
    }).toThrow();
  });
});
