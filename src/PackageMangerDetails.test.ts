import { describe, it, expect } from 'vitest';

import { PackageMangerDetails } from './PackageMangerDetails.js';
import { ComparisonResults, PackageManagerString } from './types.js';

describe('PackageMangerDetails', () => {
  it('Represents a version of a package manager', () => {
    expect(new PackageMangerDetails('npm', '9.2.0')).toEqual(
      expect.objectContaining({
        name: 'npm',
        version: '9.2.0',
      }),
    );
  });

  it('Can be created from a PackageManagerString', () => {
    expect(PackageMangerDetails.create('npm@9.2.0')).toEqual(
      expect.objectContaining({
        name: 'npm',
        version: '9.2.0',
      }),
    );

    expect(() => {
      PackageMangerDetails.create('@9.2.0' as PackageManagerString);
    }).toThrow();
  });

  it('Can be stringified', () => {
    expect(new PackageMangerDetails('npm', '9.2.0').toString()).toEqual(`npm@9.2.0`);
    expect(new PackageMangerDetails('npm', '').toString()).toEqual(`npm`);
    expect(new PackageMangerDetails('npm').toString()).toEqual(`npm`);
  });

  it('Can be compared', () => {
    const npm9 = new PackageMangerDetails('npm', '9.0.0');
    const npm8 = new PackageMangerDetails('npm', '8.0.0');
    const pnpm7 = new PackageMangerDetails('pnpm', '7.0.0');

    expect(npm8.compare(npm9)).toEqual(ComparisonResults.DifferentVersion);
    expect(npm8.compare(pnpm7)).toEqual(ComparisonResults.Different);
    expect(npm9.compare(npm9)).toEqual(ComparisonResults.Same);
  });
});
