export const ButtonSymbol = Symbol('Button');

export type ButtonMetadata = {
  id: string;
};

export function Button(id: string): MethodDecorator {
  const metadata: ButtonMetadata = {
    id,
  };

  return (target, propertyKey) => {
    Reflect.defineMetadata(ButtonSymbol, metadata, target, propertyKey);
  };
}
