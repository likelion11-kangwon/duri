export const ButtonSymbol = Symbol('Button');

export type ButtonMetadata = {
  id: string;
};

/**
 * 해당하는 id의 버튼이 클릭 될 때 호출되는 메서드를 등록하기 위한 데코레이터입니다.
 * {@link Interaction}을 통해 ButtonInteraction이 주입됩니다.
 * @param id 버튼 custom id
 */
export function Button(id: string): MethodDecorator {
  const metadata: ButtonMetadata = {
    id,
  };

  return (target, propertyKey) => {
    Reflect.defineMetadata(ButtonSymbol, metadata, target, propertyKey);
  };
}
