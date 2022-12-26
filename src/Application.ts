import { Command } from 'commander';

import type { CustomCommand } from '@commands/CustomCommand.js';

export type ApplicationSettings = {
  name: string;
  description: string;
  version: string;
  commands: CustomCommand[];
};

export default class Application extends Command {
  constructor(settings: ApplicationSettings) {
    super(settings.name);

    this.description(settings.description).version(settings.version);

    settings.commands.forEach(customCommand => {
      customCommand.register(this);
    });
  }

  registerCommand(customCommand: CustomCommand):this {
    customCommand.register(this);

    return this;
  }
}
