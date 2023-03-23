import 'reflect-metadata';

import { Container } from 'inversify';
import { fileURLToPath } from 'url';
import path from 'path';
import { getBotModule, Bot, getAutoLoadedModule } from '@likelion/bot';
import { getTomlConfigModule } from './config.js';

async function main() {
  const { DURI_CONFIG } = process.env;
  if (DURI_CONFIG === undefined)
    throw new Error('No config file specified with DURI_CONFIG');

  // 컨테이너 생성 후 초기화
  const container = new Container();

  const botModule = await getBotModule();
  const configModule = await getTomlConfigModule(DURI_CONFIG);
  const autoLoadedModules = await getAutoLoadedModule(
    path.dirname(fileURLToPath(import.meta.url)),
  );

  await container.loadAsync(configModule);
  await container.loadAsync(autoLoadedModules);
  await container.loadAsync(botModule);

  // 봇 실행
  const bot = await container.getAsync(Bot);
  await bot.start();

  // 종료
  await container.unloadAsync(botModule);
  await container.unloadAsync(autoLoadedModules);
  await container.unloadAsync(configModule);
}

await main();

export {};
