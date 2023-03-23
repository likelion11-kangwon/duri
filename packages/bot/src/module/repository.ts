import { injectable } from 'inversify';
import { Module } from './module.js';

export const RepositorySymbol = Symbol('Repository');

export function Repository(symbol?: symbol) {
  return (target: Module) => {
    injectable()(target);
    Reflect.defineMetadata(RepositorySymbol, symbol ?? null, target);
  };
}
