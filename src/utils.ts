import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { assertIsString } from '@webdeveric/utils/type-assertion';
import { isObject, isOptionalString, isString } from '@webdeveric/utils/type-predicate';
import { parse } from 'semver';

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

    assertIsString(name);
    assertIsString(version);

    return {
      name: name === 'npminstall' ? 'cnpm' : name.normalize(),
      version: version.normalize(),
    };
  }
};

export const isPackageMangerDetails = (input: unknown): input is PackageMangerDetails => {
  return (
    isObject(input) &&
    Object.hasOwn(input, 'name') &&
    Object.hasOwn(input, 'version') &&
    isString(input.name) &&
    isOptionalString(input.version)
  );
};

export const convertToSemVer = (input: string | undefined): string => {
  const parsed = parse(input);

  if (parsed === null) {
    const [version, ...rest] = (input ?? '').split(/(?=[+-])/);
    const [major = '0', minor = '0', patch = '0'] = String(version || '0').split('.');

    return `${major}.${minor}.${patch}${rest.join('')}`;
  }

  return parsed.raw;
};

export const parsePackageManager = (input: string | PackageMangerDetails): PackageMangerDetails | undefined => {
  if (isPackageMangerDetails(input)) {
    return input;
  }

  const [name, version] = input.split('@').map(part => part.trim());

  return name ? { name, version: version?.length ? convertToSemVer(version) : undefined } : undefined;
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

export const formatPackageMangerDetails = (input: PackageMangerDetails | undefined): string | undefined =>
  input ? `${input.name}${input.version ? `@${input.version}` : ''}` : input;
