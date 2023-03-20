export const InteractionSymbol = Symbol('InjectInteraction');
export type InteractionMetadata = number;

export function Interaction(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(
      InteractionSymbol,
      parameterIndex,
      target,
      propertyKey,
    );
  };
}
