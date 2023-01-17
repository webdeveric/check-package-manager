import { describe, it, expect } from 'vitest';

import {
  CliError,
  DoingItWrong,
  MisconfiguredPackageManager,
  WrongPackageManager,
  WrongPackageManagerVersion,
} from './errors.js';
import { ExitCodes } from './types.js';

describe('CliError', () => {
  it('Is an Error', () => {
    expect(new CliError('test', ExitCodes.OK)).toBeInstanceOf(Error);
  });
});

describe('CliError child classes', () => {
  it('Child classes extends from CliError', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    [DoingItWrong, MisconfiguredPackageManager, WrongPackageManager, WrongPackageManagerVersion].forEach(ChildClass => {
      expect(new ChildClass('test')).toBeInstanceOf(CliError);
    });
  });
});
