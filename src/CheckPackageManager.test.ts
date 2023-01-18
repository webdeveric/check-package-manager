import { Console } from 'node:console';
import { readFile } from 'node:fs/promises';
import { PassThrough } from 'node:stream';

import { describe, it, expect, vi, afterEach, SpyInstance } from 'vitest';

import { CheckPackageManager } from './CheckPackageManager.js';
import { CliError } from './CliError.js';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockImplementation(async () =>
    JSON.stringify({
      name: 'check-package-manager',
      packageManager: 'npm@9.2.0',
    }),
  ),
}));

const noOpConsole = new Console({
  stdout: new PassThrough(),
  stderr: new PassThrough(),
});

const infoSpy = vi.spyOn(noOpConsole, 'info');

const debugSpy = vi.spyOn(noOpConsole, 'debug');

describe('CheckPackageManager', () => {
  it('Can be instantiated', () => {
    expect(new CheckPackageManager()).toBeInstanceOf(Object);
  });

  describe('Checks the current package manager', () => {
    it('Does not throw when package manager is correct', async () => {
      vi.stubEnv('npm_config_user_agent', 'npm/8.5.5 node/v16.15.0 linux x64 workspaces/false');

      const cpm = new CheckPackageManager('npm@8.5.5', {}, noOpConsole);

      await expect(() => cpm.run()).not.toThrow();
    });

    it('Throw when using wrong package manager', async () => {
      vi.stubEnv('npm_config_user_agent', 'yarn/1.22.15 npm/? node/v16.15.0 linux x64');

      const cpm = new CheckPackageManager('npm@9.2.0', {}, noOpConsole);

      await expect(() => cpm.run()).rejects.toBeInstanceOf(CliError);
    });

    it('Throw when using wrong package manager version', async () => {
      vi.stubEnv('npm_config_user_agent', 'npm/8.5.5 node/v16.15.0 linux x64 workspaces/false');

      const cpm = new CheckPackageManager('npm@9.2.0', {}, noOpConsole);

      await expect(() => cpm.run()).rejects.toBeInstanceOf(CliError);
    });

    it('Throw when using wrong package manager version', async () => {
      vi.stubEnv('npm_config_user_agent', '');

      const cpm = new CheckPackageManager('npm@9.2.0', {}, noOpConsole);

      await expect(() => cpm.run()).rejects.toBeInstanceOf(CliError);
    });

    it('Throws when misconfigured', async () => {
      (readFile as unknown as SpyInstance).mockImplementationOnce(async () => JSON.stringify({ name: 'name' }));

      const cpm = new CheckPackageManager(undefined, {}, noOpConsole);

      await expect(() => cpm.run()).rejects.toBeInstanceOf(CliError);
    });
  });

  describe('Console messages', () => {
    afterEach(() => {
      infoSpy.mockReset();
      debugSpy.mockReset();
    });

    it('info', async () => {
      vi.stubEnv('npm_config_user_agent', 'npm/8.5.5 node/v16.15.0 linux x64 workspaces/false');

      const cpm = new CheckPackageManager('npm@8.5.5', { info: true }, noOpConsole);

      await expect(() => cpm.run()).not.toThrow();

      expect(infoSpy).toHaveBeenCalled();
      expect(debugSpy).not.toHaveBeenCalled();
    });

    it('debug', async () => {
      vi.stubEnv('npm_config_user_agent', 'npm/8.5.5 node/v16.15.0 linux x64 workspaces/false');

      const cpm = new CheckPackageManager('npm@8.5.5', { debug: true }, noOpConsole);

      await expect(() => cpm.run()).not.toThrow();

      expect(infoSpy).not.toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalled();
    });
  });
});
