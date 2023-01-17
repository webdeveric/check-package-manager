import type { PackageManagerName, PackageManagerString, VersionString } from './types.js';

const packageManagerNames = new Set<string>(['npm', 'cnpm', 'pnpm', 'yarn'] satisfies PackageManagerName[]);

export const isPackageManagerName = (input: unknown): input is PackageManagerName =>
  packageManagerNames.has(String(input));

export const isVersionString = (input: unknown): input is VersionString =>
  typeof input === 'string' && /^\d+\.\d+.\d+([-+].+)?$/.test(input);

export const isPackageManagerString = (input: unknown): input is PackageManagerString => {
  if (typeof input === 'string') {
    const [name, version] = input.split('@');

    if (isPackageManagerName(name)) {
      return typeof version === 'string' && version.length ? isVersionString(version) : true;
    }
  }

  return false;
};
