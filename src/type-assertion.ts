import { AssertionError } from 'node:assert';

import { isPackageManagerString } from './type-predicate.js';

import type { PackageManagerString } from './types.js';

export function assertIsPackageManagerString(input: unknown): asserts input is PackageManagerString {
  if (!isPackageManagerString(input)) {
    throw new AssertionError({
      message: 'input is not a valid PackageManagerString',
      actual: input,
    });
  }
}

export function assertExhaustive(actual: never, error: string | Error = 'Failed exhaustive check'): never {
  throw error instanceof Error ? error : new AssertionError({ message: error, actual });
}
