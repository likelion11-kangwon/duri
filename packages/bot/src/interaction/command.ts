export const CommandSymbol = Symbol('Command');

export type CommandMetadata = {
  name: string;
  description: string;
};

export function Command(name: string, description: string): MethodDecorator {
  const metadata: CommandMetadata = {
    name,
    description,
  };

  return (target, propertyKey) => {
    Reflect.defineMetadata(CommandSymbol, metadata, target, propertyKey);
  };
}
