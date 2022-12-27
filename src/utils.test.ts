import { describe, expect, it } from 'vitest';
import { parsePackageManager, parsePackageManagerUserAgent } from './utils.js';

describe('parsePackageManagerUserAgent()', () => {
  it('Returns undefined when given an unknown user agent', () => {
    expect(parsePackageManagerUserAgent('Not a user agent string')).toBeUndefined();
  });

  it('Returns PackageMangerDetails', () => {
    expect(parsePackageManagerUserAgent('npm/8.5.5 node/v16.15.0 linux x64 workspaces/false')).toEqual({
      name: 'npm',
      version: '8.5.5',
    });

    expect(parsePackageManagerUserAgent('yarn/1.22.15 npm/? node/v16.15.0 linux x64')).toEqual({
      name: 'yarn',
      version: '1.22.15',
    });

    expect(parsePackageManagerUserAgent('pnpm/7.19.0 npm/? node/v16.15.0 linux x64')).toEqual({
      name: 'pnpm',
      version: '7.19.0',
    });
  });

  it('Can identify cnpm', () => {
    expect(parsePackageManagerUserAgent('npminstall/6.6.2 npm/? node/v16.15.0 linux x64')).toEqual({
      name: 'cnpm',
      version: '6.6.2',
    });
  });
});

describe('parsePackageManager()', () => {
  it('Parses the "packageManager" field from a package.json file', () => {
    expect(parsePackageManager('pnpm@7.20.0')).toEqual({
      name: 'pnpm',
      version: '7.20.0',
    });
  });

  it('Invalid values return undefined', () => {
    expect(parsePackageManager('')).toBeUndefined();
    expect(parsePackageManager('pnpm')).toBeUndefined();
    expect(parsePackageManager('pnpm@')).toBeUndefined();
  });
});
