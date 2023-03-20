import glob from 'glob';
import path from 'path';

import { AsyncContainerModule } from 'inversify';
import { fileURLToPath } from 'url';
import { ControllerSymbol } from './controller.js';
import { Module } from './module.js';
import { RepositorySymbol } from './repository.js';
import { ServiceSymbol } from './service.js';

const MODULE_TYPES = ['controller', 'service', 'repository'] as const;
type ModuleType = (typeof MODULE_TYPES)[number];

function isDefined<T>(argument: T | undefined | null): argument is T {
  return argument !== undefined && argument !== null;
}

const symbols: Record<ModuleType, symbol> = {
  controller: ControllerSymbol,
  service: ServiceSymbol,
  repository: RepositorySymbol,
} as const;

// 해당 타입의 모듈을 자동으로 임포트하여 해당하는 클래스 목록을 반환한다.
async function dynamicLoadModules(
  baseDirectory: string,
  type: ModuleType,
): Promise<
  {
    interfaceSymbol?: symbol;
    module: Module;
  }[]
> {
  // 현재 디렉토리에 있는 해당 타입의 파일 목록을 가져온다.
  const files = await glob
    .glob(`**/*.${type}.{js,ts}`, {
      cwd: baseDirectory,
    })
    .then((files) => files.map((file) => `./${file}`));

  // 모듈을 다이나믹 임포트한다.

  const imported = await Promise.all(
    files.map(
      async (file) => import(`file://${path.resolve(baseDirectory, file)}`),
    ),
  );

  return imported
    .map((e) => {
      const values = Object.values(e);

      // 해당하는 타입의 메타데이터가 선언된 함수(클래스)를 불러온다.
      const module = values.find(
        (value) =>
          typeof value === 'function' &&
          Reflect.hasMetadata(symbols[type], value),
      ) as Module | undefined;
      if (module === undefined) return undefined;

      // 해당하는 타입의 실제 인터페이스 Symbol을 구한다.
      const interfaceSymbol = (Reflect.getMetadata(symbols[type], module) ??
        undefined) as symbol | undefined;

      return {
        interfaceSymbol,
        module,
      };
    })
    .filter(isDefined);
}

export async function getAutoLoadedModule(
  baseDirectory: string,
): Promise<AsyncContainerModule> {
  return new AsyncContainerModule(async (bind) => {
    await Promise.all(
      MODULE_TYPES.map(async (moduleType) => {
        const modules = await dynamicLoadModules(baseDirectory, moduleType);

        for (const { module, interfaceSymbol } of modules) {
          bind(symbols[moduleType]).to(module);
          if (interfaceSymbol !== undefined) {
            bind(interfaceSymbol).to(module);
          }
        }
      }),
    );
  });
}
