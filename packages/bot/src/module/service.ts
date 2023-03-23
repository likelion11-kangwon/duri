import { injectable } from 'inversify';
import { Module } from './module.js';

export const ServiceSymbol = Symbol('Service');

export function Service(symbol?: symbol) {
  return (target: Module) => {
    injectable()(target);
    Reflect.defineMetadata(ServiceSymbol, symbol ?? null, target);
  };
}
