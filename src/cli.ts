#!/usr/bin/env node
import util from 'node:util';

import { CheckPackageManager } from './CheckPackageManager.js';
import { CliError } from './CliError.js';
import { ExitCodes } from './types.js';

try {
  if (typeof util.parseArgs === 'function') {
    const args = util.parseArgs({
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
  } else {
    console.warn('util.parseArgs is not a function. Please use Node JS >= 16.17');
  }
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }

  process.exitCode = error instanceof CliError ? error.code : ExitCodes.DoingItWrong;
}
