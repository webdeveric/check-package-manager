import { ComparisonResults } from './types.js';

export interface ParsedPackageManager {
  name?: string | undefined;
  version?: string | undefined;
  major?: number | undefined;
  minor?: number | undefined;
  patch?: number | undefined;
  prerelease?: string | undefined;
  buildMetaData?: string | undefined;
}

export class PackageMangerDetails implements ParsedPackageManager {
  public readonly name: ParsedPackageManager['name'];

  public readonly version: ParsedPackageManager['version'];

  public readonly major: ParsedPackageManager['major'];

  public readonly minor: ParsedPackageManager['minor'];

  public readonly patch: ParsedPackageManager['patch'];

  public readonly prerelease: ParsedPackageManager['prerelease'];

  public readonly buildMetaData: ParsedPackageManager['buildMetaData'];

  constructor(input: string | ParsedPackageManager) {
    const details = typeof input === 'string' ? PackageMangerDetails.parse(input) : input;

    this.name = details.name;
    this.version = details.version;
    this.major = details.major;
    this.minor = details.minor;
    this.patch = details.patch;
    this.prerelease = details.prerelease;
    this.buildMetaData = details.buildMetaData;
  }

  static parse(input: string): ParsedPackageManager {
    // RegExp modified from https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
    const match = input.match(
      /^(?<name>[pc]?npm|yarn)(?:@(?<version>(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?)(?:\+(?<buildMetaData>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)?$/,
    );

    const { name, version, major, minor, patch, prerelease, buildMetaData } = match?.groups ?? {};

    return {
      name,
      version,
      major: major ? Number.parseInt(major) : undefined,
      minor: minor ? Number.parseInt(minor) : undefined,
      patch: patch ? Number.parseInt(patch) : undefined,
      prerelease,
      buildMetaData,
    };
  }

  toString(): string {
    return `${this.name}${this.version ? '@' + this.version : ''}`;
  }

  compare(other: PackageMangerDetails): ComparisonResults {
    if (this !== other) {
      if (this.name !== other.name) {
        return ComparisonResults.DifferentName;
      }

      if (this.version && this.version !== other.version) {
        return ComparisonResults.DifferentVersion;
      }
    }

    return ComparisonResults.Same;
  }
}
