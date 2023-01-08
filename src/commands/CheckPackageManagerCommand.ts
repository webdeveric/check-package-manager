import { satisfies } from 'semver';

import type Application from '@src/Application.js';
import { ExitCodes } from '@src/types.js';
import type { PackageMangerDetails } from '@src/types.js';
import {
  formatPackageMangerDetails,
  getConfiguredPackageManager,
  parsePackageManager,
  parsePackageManagerUserAgent,
} from '@src/utils.js';

import { CustomCommand } from './CustomCommand.js';

import type { Command } from 'commander';

export type CheckPackageManagerOptions = {
  info?: boolean;
  debug?: boolean;
};

export class CheckPackageManagerCommand extends CustomCommand {
  register(app: Application): Command {
    const command = app
      .command('check', { isDefault: true })
      .description('Check that the correct package manager is being used.')
      .argument('[packageManager]', '<package manager name>[@<version>]', parsePackageManager)
      .option('--info', 'Print info messages', false)
      // GitHub actions will set this env var when runners have debug logging enabled.
      .option('--debug', 'Print debug messages', process.env.RUNNER_DEBUG === '1')
      .action(this.action.bind(this));

    return command;
  }

  getMessages(
    code: number,
    context: {
      options: CheckPackageManagerOptions;
      calledFromDependency: boolean;
      packageManagerArg: PackageMangerDetails | undefined;
      configuredPackageManager: PackageMangerDetails | undefined;
      currentPackageManager: PackageMangerDetails | undefined;
    },
  ): string[] {
    const messages: string[] = [];

    if (context.options.debug) {
      const npmEnv = Object.entries(process.env)
        .filter(([name]) => name.startsWith('npm_'))
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');

      messages.push(
        `cwd: ${process.cwd()}`,
        `calledFromDependency: ${context.calledFromDependency}`,
        `Package manager environment variables:${npmEnv ? `\n${npmEnv}` : ' NONE'}`,
      );

      if (typeof context.packageManagerArg === 'undefined') {
        messages.push(
          'Trying to use "packageManager" property from your package.json to determine the configured package manager.',
        );
      }

      messages.push(
        `Configured package manager ${formatPackageMangerDetails(context.configuredPackageManager)}`,
        `Current package manager ${formatPackageMangerDetails(context.currentPackageManager)}`,
      );
    }

    if (typeof context.currentPackageManager === 'undefined') {
      messages.push(
        "You're doing it wrong. Call 'check-package-manager' from 'preinstall' script in your package.json file.",
      );
    }

    if (code === ExitCodes.MisconfiguredPackageManager) {
      messages.push('packageManager value not found.');
    }

    if (code & ExitCodes.WrongPackageManager && context.configuredPackageManager && context.currentPackageManager) {
      messages.push(
        `${process.env.npm_package_name} should be using ${formatPackageMangerDetails(
          context.configuredPackageManager,
        )} instead of ${formatPackageMangerDetails(context.currentPackageManager)}`,
      );

      if (!context.packageManagerArg) {
        messages.push(`Try running "corepack enable" then "${context.configuredPackageManager.name} install"`);
      }
    }

    if (context.options.info && code === ExitCodes.OK) {
      messages.push(
        context.calledFromDependency
          ? `It looks like 'check-package-manager' was called from a dependency. Not running check for ${process.env.npm_package_name}.`
          : `${process.env.npm_package_name} is using the correct package manager.`,
      );
    }

    return messages;
  }

  checkPackageManager(
    currentPackageManager: PackageMangerDetails | undefined,
    configuredPackageManager: PackageMangerDetails | undefined,
  ): ExitCodes {
    let code = ExitCodes.OK;

    if (!currentPackageManager) {
      code |= ExitCodes.DoingItWrong;
    }

    if (!configuredPackageManager) {
      code |= ExitCodes.MisconfiguredPackageManager;
    }

    if (configuredPackageManager && currentPackageManager) {
      if (configuredPackageManager.name !== currentPackageManager.name) {
        code |= ExitCodes.WrongPackageManagerName;
      }

      if (
        configuredPackageManager.version &&
        currentPackageManager.version &&
        !satisfies(currentPackageManager.version, configuredPackageManager.version)
      ) {
        code |= ExitCodes.WrongPackageManagerVersion;
      }
    }

    return code;
  }

  isDependency(cwd: string): boolean {
    return /\/(node_modules|_cacache)\/.+/.test(cwd);
  }

  async action(
    packageManagerArg: PackageMangerDetails | undefined,
    options: CheckPackageManagerOptions,
    cmd: Command,
  ): Promise<void> {
    const calledFromDependency = this.isDependency(process.cwd());

    let currentPackageManager: PackageMangerDetails | undefined;
    let configuredPackageManager: PackageMangerDetails | undefined;
    let code = ExitCodes.OK;

    if (!calledFromDependency) {
      currentPackageManager = parsePackageManagerUserAgent(process.env.npm_config_user_agent);

      configuredPackageManager = packageManagerArg
        ? parsePackageManager(packageManagerArg)
        : await getConfiguredPackageManager();

      code = this.checkPackageManager(currentPackageManager, configuredPackageManager);
    }

    process.exitCode = code;

    const messages = this.getMessages(code, {
      options,
      calledFromDependency,
      packageManagerArg,
      configuredPackageManager,
      currentPackageManager,
    });

    messages.forEach(message => cmd.configureOutput().writeOut?.(`${message}\n`));
  }
}
