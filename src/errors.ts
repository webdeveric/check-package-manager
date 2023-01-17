import { ExitCodes } from './types.js';

export class CliError extends Error {
  code: ExitCodes;

  constructor(message: string | undefined, code: ExitCodes) {
    super(message);

    this.code = code;
  }
}

export class DoingItWrong extends CliError {
  constructor(message?: string) {
    super(message, ExitCodes.DoingItWrong);
  }
}

export class MisconfiguredPackageManager extends CliError {
  constructor(message?: string) {
    super(message, ExitCodes.MisconfiguredPackageManager);
  }
}

export class WrongPackageManager extends CliError {
  constructor(message?: string) {
    super(message, ExitCodes.WrongPackageManager);
  }
}

export class WrongPackageManagerVersion extends CliError {
  constructor(message?: string) {
    super(message, ExitCodes.WrongPackageManagerVersion);
  }
}
