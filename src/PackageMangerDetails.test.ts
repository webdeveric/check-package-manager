import { describe, it, expect } from 'vitest';

import { PackageMangerDetails } from './PackageMangerDetails.js';
import { ComparisonResults } from './types.js';

describe('PackageMangerDetails', () => {
  it('Represents a version of a package manager', () => {
    expect(
      new PackageMangerDetails({
        name: 'npm',
        version: '1.2.3',
        major: 1,
        minor: 2,
        patch: 3,
      }),
    ).toEqual(
      expect.objectContaining({
        name: 'npm',
        version: '1.2.3',
        major: 1,
        minor: 2,
        patch: 3,
      }),
    );
  });

  it('Can be created from a PackageManagerString', () => {
    expect(new PackageMangerDetails('npm@9.2.0')).toEqual(
      expect.objectContaining({
        name: 'npm',
        major: 9,
        minor: 2,
        patch: 0,
      }),
    );

    expect(
      new PackageMangerDetails('pnpm@8.13.0+sha256.fbcf256db6d06bc189e31df34b3ed61220f3ba9f78a2ca8fe7be0fce4670dbd3'),
    ).toEqual(
      expect.objectContaining({
        name: 'pnpm',
        major: 8,
        minor: 13,
        patch: 0,
      }),
    );
  });

  it('Can be stringified', () => {
    expect(new PackageMangerDetails('pnpm@1.2.3').toString()).toEqual('pnpm@1.2.3');
    expect(new PackageMangerDetails('pnpm').toString()).toEqual('pnpm');
  });

  it('Can be compared', () => {
    const npm9 = new PackageMangerDetails('npm@9.0.0');
    const npm8 = new PackageMangerDetails('npm@8.0.0');
    const pnpm7 = new PackageMangerDetails('pnpm@7.0.0');

    expect(npm8.compare(npm9)).toEqual(ComparisonResults.DifferentVersion);
    expect(npm8.compare(pnpm7)).toEqual(ComparisonResults.DifferentName);
    expect(npm9.compare(npm9)).toEqual(ComparisonResults.Same);
  });

  describe('PackageMangerDetails.parse()', () => {
    it('Parsed the packageManager property from package.json', () => {
      expect(PackageMangerDetails.parse('npm@1.2.3')).toEqual({
        name: 'npm',
        version: '1.2.3',
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: undefined,
        buildMetaData: undefined,
      });

      expect(PackageMangerDetails.parse('yarn@1.2.3')).toEqual({
        name: 'yarn',
        version: '1.2.3',
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: undefined,
        buildMetaData: undefined,
      });

      expect(PackageMangerDetails.parse('cnpm@1.2.3')).toEqual({
        name: 'cnpm',
        version: '1.2.3',
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: undefined,
        buildMetaData: undefined,
      });

      expect(PackageMangerDetails.parse('pnpm@8.13.0')).toEqual({
        name: 'pnpm',
        version: '8.13.0',
        major: 8,
        minor: 13,
        patch: 0,
        prerelease: undefined,
        buildMetaData: undefined,
      });

      expect(PackageMangerDetails.parse('pnpm@8.13.0-alpha.1')).toEqual({
        name: 'pnpm',
        version: '8.13.0-alpha.1',
        major: 8,
        minor: 13,
        patch: 0,
        prerelease: 'alpha.1',
        buildMetaData: undefined,
      });

      expect(
        PackageMangerDetails.parse(
          'pnpm@8.13.0+sha256.fbcf256db6d06bc189e31df34b3ed61220f3ba9f78a2ca8fe7be0fce4670dbd3',
        ),
      ).toEqual({
        name: 'pnpm',
        version: '8.13.0',
        major: 8,
        minor: 13,
        patch: 0,
        prerelease: undefined,
        buildMetaData: 'sha256.fbcf256db6d06bc189e31df34b3ed61220f3ba9f78a2ca8fe7be0fce4670dbd3',
      });
    });

    it('Bad data gets undefined values', () => {
      expect(PackageMangerDetails.parse('bad data')).toEqual({
        name: undefined,
        version: undefined,
        major: undefined,
        minor: undefined,
        patch: undefined,
        prerelease: undefined,
        buildMetaData: undefined,
      });
    });
  });
});
