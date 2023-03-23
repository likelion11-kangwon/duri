import { injectable } from 'inversify';
import { Module } from './module.js';

export const ControllerSymbol = Symbol('Controller');

export function Controller(symbol?: symbol) {
  return (target: Module) => {
    injectable()(target);
    Reflect.defineMetadata(ControllerSymbol, symbol ?? null, target);
  };
}
