export class BotConfig {
  applicationId!: string;
  token!: string;

  constructor(config: BotConfig) {
    Object.assign(this, config);
  }
}
