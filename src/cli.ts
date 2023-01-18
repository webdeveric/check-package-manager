#!/usr/bin/env node
import { parseArgs } from 'node:util';

import { CheckPackageManager } from './CheckPackageManager.js';
import { CliError } from './CliError.js';
import { ExitCodes } from './types.js';

try {
  const args = parseArgs({
    allowPositionals: true,
    options: {
      info: {
        type: 'boolean',
        short: 'i',
        default: false,
      },
      debug: {
        type: 'boolean',
        short: 'd',
        default: false,
      },
    },
  });

  const check = new CheckPackageManager(args.positionals.at(0), args.values);

  await check.run();
} catch (error) {
  if (error instanceof CliError) {
    process.exitCode = error.code;
  }

  if (error instanceof Error) {
    console.error(error.message);
  }

  process.exitCode ||= ExitCodes.DoingItWrong;
}
