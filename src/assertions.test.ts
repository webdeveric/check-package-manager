import {
  describe, expect, it,
} from 'vitest';

import { assertSatisfiesSemver, assertSupportedNodeVersion } from './assertions.js';

describe('assertSatisfiesSemver()', () => {
  it('Does not throw when version is satisfied', () => {
    expect(() => {
      assertSatisfiesSemver('1.2.3', '^1.2.3');
    }).not.toThrow();
  });

  it('Throws when version is not satisfied', () => {
    expect(() => {
      assertSatisfiesSemver('1.2.3', '^2.1.0');
    }).toThrow();
  });
});

describe('assertSupportedNodeVersion()', () => {
  it('Throws when running unsupported NodeJs version', () => {
    expect(() => {
      assertSupportedNodeVersion('1.2.3');
    }).toThrow();
  });
});
