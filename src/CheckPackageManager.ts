import { Console } from 'node:console';

import { CliError } from './CliError.js';
import { PackageMangerDetails } from './PackageMangerDetails.js';
import { assertIsPackageManagerString } from './type-assertion.js';
import { CheckPackageManagerOptions, ComparisonResults, ExitCodes, type DeepNonNullable } from './types.js';
import { getConfiguredPackageManager, isDependency, parsePackageManagerUserAgent } from './utils.js';

export class CheckPackageManager {
  packageManagerArg: string | undefined;

  options: DeepNonNullable<CheckPackageManagerOptions>;

  protected readonly console: Console;

  constructor(
    packageManagerArg?: string,
    options: Partial<CheckPackageManagerOptions> = {},
    console = new Console({ stdout: process.stdout, stderr: process.stderr }),
  ) {
    this.packageManagerArg = packageManagerArg;

    this.options = {
      info: options.info ?? false,
      // GitHub actions will set this env var when runners have debug logging enabled.
      debug: options.debug ?? process.env.RUNNER_DEBUG === '1',
    };

    this.console = console;
  }

  /**
   * The packageManager passed in the cli arguments takes priority over what is defined in the package.json file.
   */
  async getRequiredPackageManager(): Promise<PackageMangerDetails | undefined> {
    if (this.packageManagerArg) {
      assertIsPackageManagerString(this.packageManagerArg);

      return PackageMangerDetails.create(this.packageManagerArg);
    }

    this.info(
      'Trying to use "packageManager" property from your package.json to determine the configured package manager.',
    );

    const configuredPackageManager = await getConfiguredPackageManager();

    return configuredPackageManager ? PackageMangerDetails.create(configuredPackageManager) : undefined;
  }

  info(...args: Parameters<Console['info']>): void {
    if (this.options.info) {
      this.console.info(...args);
    }
  }

  debug(...args: Parameters<Console['debug']>): void {
    if (this.options.debug) {
      this.console.debug(...args);
    }
  }

  async run(): Promise<void> {
    const calledFromDependency = isDependency(process.cwd());

    if (this.options.debug) {
      const npmEnv = Object.entries(process.env)
        .filter(([name]) => name.startsWith('npm_'))
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');

      [
        `cwd: ${process.cwd()}`,
        `calledFromDependency: ${calledFromDependency}`,
        `npm env vars:${npmEnv ? `\n${npmEnv}` : ' NONE'}`,
        `Package manager argument: ${this.packageManagerArg}`,
      ].forEach(message => this.debug(message));
    }

    if (calledFromDependency) {
      this.info("Skipping package manager checks since 'check-package-manager' was called from a dependency.");

      return;
    }

    const currentPackageManagerString = parsePackageManagerUserAgent(process.env.npm_config_user_agent);

    const currentPackageManager = currentPackageManagerString
      ? PackageMangerDetails.create(currentPackageManagerString)
      : undefined;

    this.debug(`Current package manager: ${currentPackageManager}`);

    if (!currentPackageManager) {
      throw new CliError(
        "You're doing it wrong. Call 'check-package-manager' from 'preinstall' script in your package.json file.",
        ExitCodes.DoingItWrong,
      );
    }

    const requiredPackageManager = await this.getRequiredPackageManager();

    this.debug(`Required package manager: ${requiredPackageManager}`);

    if (!requiredPackageManager) {
      this.info(
        'Trying to use "packageManager" property from your package.json to determine the configured package manager.',
      );

      throw new CliError(
        'The required package manager was not configured correctly.',
        ExitCodes.MisconfiguredPackageManager,
      );
    }

    const comparison = requiredPackageManager.compare(currentPackageManager);

    if (comparison === ComparisonResults.Same) {
      this.info(`${process.env.npm_package_name} is using the correct package manager.`);
    } else {
      if (!this.packageManagerArg) {
        this.info(`Try running "corepack enable" then "${requiredPackageManager.name} install"`);
      }

      throw new CliError(
        `${process.env.npm_package_name} should be using ${requiredPackageManager} instead of ${currentPackageManagerString}`,
        comparison === ComparisonResults.DifferentName
          ? ExitCodes.WrongPackageManager
          : ExitCodes.WrongPackageManagerVersion,
      );
    }
  }
}
