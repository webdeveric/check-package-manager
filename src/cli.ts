#!/usr/bin/env node
import { description, name, version } from 'check-package-manager/package.json';

import { CheckPackageManagerCommand } from '@commands/CheckPackageManagerCommand.js';

import Application from './Application.js';
import { assertSupportedNodeVersion } from './assertions.js';

try {
  assertSupportedNodeVersion(process.versions.node);

  const app = new Application({
    name: name,
    description: description,
    version: version,
    commands: [new CheckPackageManagerCommand()],
  });

  await app.parseAsync(process.argv);
} catch (error) {
  console.error(error);

  process.exitCode ||= 1;
}
