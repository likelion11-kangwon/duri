export const OptionSymbol = Symbol('Option');
type OptionType = typeof String | typeof Number | typeof Boolean;

export type OptionMetadata = {
  parameterIndex: number;
  name: string;
  type: OptionType;
  description: string;
  required?: boolean;
};

export function Option(
  name: string,
  type: OptionType,
  description: string,
  required?: boolean,
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const options = (Reflect.getMetadata(OptionSymbol, target, propertyKey) ??
      []) as OptionMetadata[];

    options.push({
      parameterIndex,
      name,
      type,
      description,
      required,
    });

    Reflect.defineMetadata(OptionSymbol, options, target, propertyKey);
  };
}
