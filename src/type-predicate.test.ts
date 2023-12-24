import { describe, expect, it } from 'vitest';

import { isPackageManagerName, isPackageManagerString, isVersionString } from './type-predicate.js';

describe('isPackageManagerName()', () => {
  it('Returns true for valid input', () => {
    expect(isPackageManagerName('npm')).toBeTruthy();
    expect(isPackageManagerName('fake')).toBeFalsy();
  });
});

describe('isVersionString()', () => {
  it('Returns true for valid input', () => {
    expect(isVersionString('1.2.3')).toBeTruthy();
    expect(isVersionString('not a version string')).toBeFalsy();
  });
});

describe('isPackageManagerString()', () => {
  it('Returns true for valid input', () => {
    expect(isPackageManagerString('npm')).toBeTruthy();
    expect(isPackageManagerString('npm@')).toBeTruthy();
    expect(isPackageManagerString('npm@1.2.3')).toBeTruthy();
    expect(
      isPackageManagerString('pnpm@8.13.0+sha256.fbcf256db6d06bc189e31df34b3ed61220f3ba9f78a2ca8fe7be0fce4670dbd3'),
    ).toBeTruthy();
    expect(isPackageManagerString('not a version string')).toBeFalsy();
  });
});
