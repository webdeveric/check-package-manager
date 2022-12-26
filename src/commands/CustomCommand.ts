import type { Command } from 'commander';

import type Application from '@src/Application.js';

export abstract class CustomCommand {
  constructor(app?: Application) {
    app && this.register(app);
  }

  abstract action(...args: unknown[]): Promise<void>;

  abstract register(app: Application): Command;
}
