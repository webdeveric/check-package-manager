export enum ComparisonResults {
  Same,
  DifferentName,
  DifferentVersion,
}

export enum ExitCodes {
  OK = 0,
  DoingItWrong = 1,
  MisconfiguredPackageManager = 2,
  WrongPackageManager = 3,
  WrongPackageManagerVersion = 4,
}

export type CheckPackageManagerOptions = {
  info: boolean | undefined;
  debug: boolean | undefined;
};

export type DeepNonNullable<T> = T extends Record<PropertyKey, unknown>
  ? {
      [P in keyof T]: DeepNonNullable<T[P]>;
    }
  : NonNullable<T>;

export type PackageManagerName = 'npm' | 'cnpm' | 'pnpm' | 'yarn';

export type VersionExtension = `-${string}`;

export type BuildMetaData = `+${string}`;

export type VersionString = `${number}.${number}.${number}${'' | VersionExtension}${'' | BuildMetaData}`;

export type PackageManagerString = PackageManagerName | `${PackageManagerName}@${VersionString}`;
