import { ApplicationCommandOptionAllowedChannelTypes } from 'discord.js';

export const OptionSymbol = Symbol('Option');

export type OptionMetadata = {
  parameterIndex: number;
  name: string;
  description: string;
  required?: boolean;
} & (
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | {
      type: 'channel';
      channelTypes?: ApplicationCommandOptionAllowedChannelTypes[];
    }
);

/**
 * Command에 인자를 등록하고 주입받기 위한 데코레이터입니다.
 * @example
 * ```ts
 * @Controller()
 * export class TestController {
 *    @Command('add', '숫자를 더합니다')
 *    async add(
 *      @Interaction() interaction: ChatInputCommandInteraction,
 *      @Option('a', Number, 'a', true) a: number, // Number 타입의 필수 인자 'a' 추가
 *      @Option('b', Number, 'b', true) b: number, // Number 타입의 필수 인자 'b' 추가
 *    ) {
 *      // ...
 *    }
 * }
 * ```
 *
 * @param name 인자 이름
 * @param type 인자 타입 (Number, String, Boolean)
 * @param description 인자 설명
 * @param required 필수 인자 여부
 */
export function Option(
  name: string,
  type: OptionMetadata['type'],
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
