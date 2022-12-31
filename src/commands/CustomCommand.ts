import type Application from '@src/Application.js';

import type { Command } from 'commander';

export abstract class CustomCommand {
  constructor(app?: Application) {
    app && this.register(app);
  }

  abstract action(...args: unknown[]): Promise<void>;

  abstract register(app: Application): Command;
}
