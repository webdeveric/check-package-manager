import { Console } from 'node:console';

import {
  DoingItWrong,
  MisconfiguredPackageManager,
  WrongPackageManager,
  WrongPackageManagerVersion,
} from './errors.js';
import { PackageMangerDetails } from './PackageMangerDetails.js';
import { assertIsPackageManagerString, assertExhaustive } from './type-assertion.js';
import { CheckPackageManagerOptions, ComparisonResults, type DeepNonNullable } from './types.js';
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
      debug: options.debug ?? false,
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

    this.debug(`calledFromDependency: ${calledFromDependency}`);

    if (calledFromDependency) {
      this.info("Skipping package manager checks since 'check-package-manager' was called from a dependency.");

      return;
    }

    const currentPackageManagerString = parsePackageManagerUserAgent(process.env.npm_config_user_agent);

    const currentPackageManager = currentPackageManagerString
      ? PackageMangerDetails.create(currentPackageManagerString)
      : undefined;

    const requiredPackageManager = await this.getRequiredPackageManager();

    if (this.options.debug) {
      const npmEnv = Object.entries(process.env)
        .filter(([name]) => name.startsWith('npm_'))
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');

      [
        `cwd: ${process.cwd()}`,
        `npm env vars:${npmEnv ? `\n${npmEnv}` : ' NONE'}`,
        `Current package manager: ${currentPackageManagerString}`,
        `Package manager argument: ${this.packageManagerArg}`,
        `Required package manager: ${requiredPackageManager}`,
      ].forEach(message => this.debug(message));
    }

    if (!currentPackageManager) {
      throw new DoingItWrong(
        "You're doing it wrong. Call 'check-package-manager' from 'preinstall' script in your package.json file.",
      );
    }

    if (!requiredPackageManager) {
      this.info(
        'Trying to use "packageManager" property from your package.json to determine the configured package manager.',
      );

      throw new MisconfiguredPackageManager('The required package manager was not configured correctly.');
    }

    const comparison = requiredPackageManager.compare(currentPackageManager);

    switch (comparison) {
      case ComparisonResults.Same:
        this.info(`${process.env.npm_package_name} is using the correct package manager.`);

        break;
      case ComparisonResults.Different:
        this.info(`Try running "corepack enable" then "${requiredPackageManager.name} install"`);

        throw new WrongPackageManager(
          `${process.env.npm_package_name} should be using ${requiredPackageManager} instead of ${currentPackageManagerString}`,
        );
      case ComparisonResults.DifferentVersion:
        throw new WrongPackageManagerVersion(
          `${process.env.npm_package_name} should be using ${requiredPackageManager} instead of ${currentPackageManagerString}`,
        );
      default:
        assertExhaustive(comparison);
    }
  }
}
