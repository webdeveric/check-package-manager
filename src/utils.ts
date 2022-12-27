import path from 'node:path';
import { readFile } from 'node:fs/promises';

import type { PackageMangerDetails } from './types.js';

/**
 * Parse the package manager user agent string
 *
 * @example
 * `npm/8.5.5 node/v16.15.0 linux x64 workspaces/false`
 * `npminstall/6.6.2 npm/? node/v16.15.0 linux x64`
 * `yarn/1.22.15 npm/? node/v16.15.0 linux x64
 * `pnpm/7.19.0 npm/? node/v16.15.0 linux x64
 */
export const parsePackageManagerUserAgent = (userAgent?: string): PackageMangerDetails | undefined => {
  const match = userAgent?.match(/^([a-z]+)\/([^\s]+)/i);

  if (Array.isArray(match)) {
    const name = match.at(1);
    const version = match.at(2);

    return {
      name: name === 'npminstall' ? 'cnpm' : name?.normalize(),
      version: version?.normalize(),
    };
  }
};

export const parsePackageManager = (input: string): PackageMangerDetails | undefined => {
  const [name, version] = input.split('@');

  return name && version ? { name, version } : undefined;
};

export const getJson = async <T extends Record<string, unknown> = Record<string, unknown>>(
  filePath: string,
): Promise<T> => {
  const contents = await readFile(filePath, 'utf-8');

  const data = JSON.parse(contents);

  return data;
};

export const getPackageJsonPath = (): string => {
  return process.env.npm_package_json ?? path.resolve(process.cwd(), './package.json');
};

export const getPackageJson = async <T extends Record<string, unknown> = Record<string, unknown>>(): Promise<T> => {
  return await getJson<T>(getPackageJsonPath());
};

export const getPackageManagerFromPackageJson = async (): Promise<string | undefined> => {
  const { packageManager } = await getPackageJson<{
    packageManager?: string;
  }>();

  return packageManager;
};

export const getConfiguredPackageManager = async (): Promise<PackageMangerDetails | undefined> => {
  const packageManager =
    // Yarn and pnpm will define this env var.
    process.env.npm_package_packageManager ?? (await getPackageManagerFromPackageJson());

  if (packageManager) {
    return parsePackageManager(packageManager);
  }
};
