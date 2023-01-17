import assert from 'node:assert';

import { isVersionString } from './type-predicate.js';
import { VersionString, PackageManagerString, ComparisonResults } from './types.js';

export class PackageMangerDetails {
  public readonly name: string;

  public readonly version: VersionString | undefined;

  constructor(name: string, version?: string | undefined) {
    this.name = name;

    if (isVersionString(version)) {
      this.version = version;
    }
  }

  static create(input: PackageManagerString): PackageMangerDetails {
    const [name, version] = input.split('@');

    assert(name);

    return new PackageMangerDetails(name, version);
  }

  toString(): string {
    return `${this.name}${this.version ? `@${this.version}` : ''}`;
  }

  compare(details: PackageMangerDetails): ComparisonResults {
    if (this !== details) {
      if (this.name !== details.name) {
        return ComparisonResults.Different;
      }

      if (typeof this.version === 'string' && this.version !== details.version) {
        return ComparisonResults.DifferentVersion;
      }
    }

    return ComparisonResults.Same;
  }
}
