import { satisfies } from 'semver';

import { getConfiguredPackageManager, parsePackageManager, parsePackageManagerUserAgent } from '@src/utils.js';
import { CustomCommand } from './CustomCommand.js';
import { ExitCodes } from '@src/types.js';

import type Application from '@src/Application.js';
import type { Command } from 'commander';
import type { PackageMangerDetails } from '@src/types.js';

export type CheckPackageManagerOptions = {
  info?: boolean;
  debug?: boolean;
};

export class CheckPackageManagerCommand extends CustomCommand {
  register(app: Application): Command {
    const command = app
      .command('check', { isDefault: true })
      .description('Check that the correct package manager is being used.')
      .argument('[packageManager]', 'Package manager name and version')
      .option('--info', 'Print info messages', false)
      .option('--debug', 'Print debug messages', false)
      .action(this.action.bind(this));

    return command;
  }

  getMessages(
    code: number,
    context: {
      options: CheckPackageManagerOptions;
      calledFromDependency: boolean;
      packageManagerArg: string | undefined;
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
          'Using "packageManager" property from your package.json to determine the configured package manager.',
        );
      }

      messages.push(
        context.configuredPackageManager
          ? `Configured package manager: ${context.configuredPackageManager.name}@${context.configuredPackageManager.version}`
          : `Configured package manager: ${context.configuredPackageManager}`,
        context.currentPackageManager
          ? `Current package manager: ${context.currentPackageManager.name}@${context.currentPackageManager.version}`
          : `Current package manager: ${context.currentPackageManager}`,
      );
    }

    if (typeof context.currentPackageManager === 'undefined') {
      messages.push(
        "You're doing it wrong. Call 'check-package-manager' from 'preinstall' script in your package.json file.",
      );
    }

    if (code & ExitCodes.WrongPackageManager && context.configuredPackageManager && context.currentPackageManager) {
      messages.push(
        `${process.env.npm_package_name} should be using ${context.configuredPackageManager.name} version ${context.configuredPackageManager.version} instead of ${context.currentPackageManager.name} version ${context.currentPackageManager.version}`,
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
    packageManagerArg: string | undefined,
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
