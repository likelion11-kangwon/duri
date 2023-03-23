import { z } from 'zod';
import { AsyncContainerModule } from 'inversify';
import toml from '@iarna/toml';
import fs from 'fs/promises';
import { BotConfig } from '@likelion/bot/src/config.js';

const schema = z
  .object({
    bot: z
      .object({
        applicationId: z.string().min(1),
        token: z.string().min(1),
      })
      .required(),
  })
  .required();

export const CONFIG_SYMBOL = Symbol('Config');
export type Config = z.infer<typeof schema>;

async function configFrom(value: unknown): Promise<Config> {
  // value 값이 Config 형태에 올바른지 검증한다.
  return schema.parseAsync(value);
}

// TOML에서 불러온 Config을 Bind하는 모듈을 얻는다
export const getTomlConfigModule = async (path: string) => {
  const text = await fs.readFile(path).then((text) => text.toString('utf-8'));
  const config = await configFrom(toml.parse(text));

  return new AsyncContainerModule(async (bind) => {
    bind(BotConfig).toDynamicValue(() => new BotConfig(config.bot));
  });
};
