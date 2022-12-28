export type PackageMangerDetails = {
  name: string;
  version: string | undefined;
};

export enum ExitCodes {
  OK = 0,
  DoingItWrong = 1,
  MisconfiguredPackageManager = 2,
  WrongPackageManagerName = 4,
  WrongPackageManagerVersion = 8,
  WrongPackageManager = WrongPackageManagerName | WrongPackageManagerVersion,
}
