import assert from 'node:assert';

import { satisfies } from 'semver';

export function assertSatisfiesSemver(version: string, targetVersion: string, message?: string): asserts version {
  assert(
    satisfies(version, targetVersion),
    message ?? `Version ${targetVersion} is required. You're using version ${version}.`,
  );
}

export function assertSupportedNodeVersion(version: string): asserts version {
  const targetVersion = String(process.env.npm_package_engines_node);

  assertSatisfiesSemver(version, targetVersion, `Node ${targetVersion} is required. You're using version ${version}.`);
}
