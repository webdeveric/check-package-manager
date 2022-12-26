import { satisfies } from 'semver';

import {
  getConfiguredPackageManager, parsePackageManager, parsePackageManagerUserAgent,
} from '@src/utils.js';
import { CustomCommand } from './CustomCommand.js';
import { ExitCodes } from '@src/types.js';

import type Application from '@src/Application.js';
import type { Command } from 'commander';
import type { PackageMangerDetails } from '@src/types.js';

export class CheckPackageManagerCommand extends CustomCommand {
  register(app: Application): Command {
    const command = app
      .command('check', { isDefault: true })
      .description('Check that the correct package manager is being used.')
      .argument('[packageManager]', 'Package manager name and version')
      .option('--debug', 'Print debug messages', false)
      .action(this.action.bind(this));

    return command;
  }

  checkPackageManagerVersion(
    currentPackageManager: PackageMangerDetails | undefined,
    configuredPackageManager: PackageMangerDetails | undefined,
    debug = false,
  ): {
    code: number;
    messages: string[];
  } {
    const messages: string[] = [];

    let code = ExitCodes.OK;

    if (! currentPackageManager) {
      messages.push(
        'You\'re doing it wrong. Call `check-package-manager` from `preinstall` script in your package.json file.',
      );

      code |= ExitCodes.DoingItWrong;
    }

    if (debug) {
      configuredPackageManager &&
        messages.push(
          `[DEBUG] Configured package manager: ${configuredPackageManager?.name}@${configuredPackageManager?.version}`,
        );
      currentPackageManager &&
        messages.push(
          `[DEBUG] Current package manager: ${currentPackageManager?.name}@${currentPackageManager?.version}`,
        );
    }

    if (configuredPackageManager && currentPackageManager) {
      if (configuredPackageManager.name !== currentPackageManager.name) {
        code |= ExitCodes.WrongPackageManagerName;
      }

      if (configuredPackageManager.version && currentPackageManager.version && ! satisfies(currentPackageManager.version, configuredPackageManager.version)) {
        code |= ExitCodes.WrongPackageManagerVersion;
      }

      if (code & ExitCodes.WrongPackageManager) {
        messages.push(
          `You should be using ${configuredPackageManager.name} version ${configuredPackageManager.version} instead of ${currentPackageManager.name} version ${currentPackageManager.version}`,
        );
      }
    }

    return { code, messages };
  }

  async action(
    packageManagerArg: string | undefined,
    options: {
      debug?: boolean;
    },
    cmd: Command,
  ): Promise<void> {
    const currentPackageManager = parsePackageManagerUserAgent(process.env.npm_config_user_agent);
    const configuredPackageManager = packageManagerArg ? parsePackageManager(packageManagerArg) : await getConfiguredPackageManager();

    const { code, messages } = this.checkPackageManagerVersion(
      currentPackageManager,
      configuredPackageManager,
      options.debug,
    );

    if (process.env.NODE_ENV === 'development') {
      if (options.debug) {
        console.debug({
          npmEnv: Object.fromEntries(
            Object.entries(process.env)
              .filter(([ name ]) => name.startsWith('npm_'))
              .sort((left, right) => left[ 0 ].localeCompare(right[ 0 ])),
          ),
        });
      }
    }

    process.exitCode = code;

    if (code !== ExitCodes.OK && ! packageManagerArg && configuredPackageManager && currentPackageManager) {
      messages.push(`Try running "corepack enable" then "${configuredPackageManager.name} install"`);
    }

    messages.forEach(message =>
      cmd.configureOutput().writeOut?.(`${message}\n\n`),
    );
  }
}
