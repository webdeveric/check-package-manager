import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it, vi, SpyInstance } from 'vitest';

import {
  getConfiguredPackageManager,
  getJson,
  getPackageJson,
  getPackageJsonPath,
  getPackageManagerFromPackageJson,
  isDependency,
  parsePackageManagerUserAgent,
} from './utils.js';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockImplementation(async () =>
    JSON.stringify({
      name: 'check-package-manager',
      packageManager: 'npm@9.2.0',
    }),
  ),
}));

describe('isDependency()', () => {
  it('Returns true if the path looks like a dependency', () => {
    expect(isDependency('/some/path/repo/')).toBeFalsy();
    expect(isDependency('/some/path/repo/node_modules/some-package/')).toBeTruthy();
    expect(isDependency('D:\\some\\path\\repo\\node_modules\\some-package')).toBeTruthy();
  });
});

describe('parsePackageManagerUserAgent()', () => {
  it('Returns undefined when given an unknown user agent', () => {
    expect(parsePackageManagerUserAgent('Not a user agent string')).toBeUndefined();
  });

  it('Returns PackageMangerDetails', () => {
    expect(parsePackageManagerUserAgent('npm/8.5.5 node/v16.15.0 linux x64 workspaces/false')).toEqual('npm@8.5.5');

    expect(parsePackageManagerUserAgent('yarn/1.22.15 npm/? node/v16.15.0 linux x64')).toEqual('yarn@1.22.15');

    expect(parsePackageManagerUserAgent('pnpm/7.19.0 npm/? node/v16.15.0 linux x64')).toEqual('pnpm@7.19.0');
  });

  it('Can identify cnpm', () => {
    expect(parsePackageManagerUserAgent('npminstall/6.6.2 npm/? node/v16.15.0 linux x64')).toEqual('cnpm@6.6.2');
  });
});

describe('getJson()', () => {
  it('Returns parsed JSON data from a file', async () => {
    const packageJson = resolve(__dirname, '../package.json');

    await expect(getJson(packageJson)).resolves.toEqual(
      expect.objectContaining({
        name: 'check-package-manager',
      }),
    );
  });
});

describe('getPackageJsonPath()', () => {
  describe('Returns the path to package.json file', () => {
    it('Looks in the env first', () => {
      vi.stubEnv('npm_package_json', '/tmp/package.json');

      expect(getPackageJsonPath()).toEqual('/tmp/package.json');
    });

    it('Looks in the cwd', () => {
      vi.stubEnv('npm_package_json', '');

      const spy = vi.spyOn(process, 'cwd');

      spy.mockReturnValue('/tmp/cwd');

      expect(getPackageJsonPath()).toEqual('/tmp/cwd/package.json');
      expect(spy).toHaveBeenCalledOnce();

      spy.mockRestore();
    });
  });
});

describe('getPackageJson()', () => {
  it('Gets the JSON data from package.json', async () => {
    await expect(getPackageJson()).resolves.toEqual(
      expect.objectContaining({
        name: 'check-package-manager',
      }),
    );
  });
});

describe('getPackageManagerFromPackageJson()', () => {
  it('Gets the JSON data from package.json', async () => {
    await expect(getPackageManagerFromPackageJson()).resolves.toBeTypeOf('string');
  });
});

describe('getConfiguredPackageManager()', () => {
  it('Looks in the env first', async () => {
    vi.stubEnv('npm_package_packageManager', 'npm@9.2.0');

    await expect(getConfiguredPackageManager()).resolves.toEqual('npm@9.2.0');
  });

  it('Looks for the packageManager property', async () => {
    vi.stubEnv('npm_package_packageManager', '');

    await expect(getConfiguredPackageManager()).resolves.toEqual('npm@9.2.0');
  });

  it('Returns undefined when unable to find packageManager', async () => {
    vi.stubEnv('npm_package_packageManager', '');

    (readFile as unknown as SpyInstance).mockImplementationOnce(async () => JSON.stringify({ name: 'name' }));

    await expect(getConfiguredPackageManager()).resolves.toBeUndefined();
  });
});
