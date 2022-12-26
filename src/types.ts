export type PackageMangerDetails = {
  name: string | undefined;
  version: string | undefined;
};

export enum ExitCodes {
  OK = 0,
  DoingItWrong = 1,
  WrongPackageManagerName = 2,
  WrongPackageManagerVersion = 4,
  WrongPackageManager = WrongPackageManagerName | WrongPackageManagerVersion,
}
