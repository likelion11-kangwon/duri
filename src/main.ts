import 'reflect-metadata';

import { Bot, getBotModule } from './bot.js';
import { Container } from 'inversify';
import { getTomlConfigModule } from './config.js';
import { getAutoLoadedModule } from './module/auto-load.js';
import { fileURLToPath } from 'url';
import path from 'path';

async function main() {
  // 컨테이너 생성 후 초기화
  const container = new Container();

  const botModule = await getBotModule();
  const configModule = await getTomlConfigModule('.config.toml');
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
