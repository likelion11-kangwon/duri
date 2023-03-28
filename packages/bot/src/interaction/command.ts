export const CommandSymbol = Symbol('Command');

export type CommandMetadata = {
  name: string;
  description: string;
};

/**
 * 지정한 name을 가진 Command 입력 시 호출되는 메서드를 등록하기 위한 데코레이터입니다.
 * {@link Interaction}을 통해 ChatInputCommandInteraction이 주입됩니다.
 * {@link Option}을 통해 인자를 등록하고 주입할 수 있습니다.
 * @param name Command 이름
 * @param description Command 설명
 */
export function Command(name: string, description: string): MethodDecorator {
  const metadata: CommandMetadata = {
    name,
    description,
  };

  return (target, propertyKey) => {
    Reflect.defineMetadata(CommandSymbol, metadata, target, propertyKey);
  };
}
