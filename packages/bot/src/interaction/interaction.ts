export const InteractionSymbol = Symbol('InjectInteraction');
export type InteractionMetadata = number;

/**
 * 사용자의 요청과 소통하기 위한 Interaction 인터페이스를 주입하기 위한 데코레이터입니다.
 * Interaction 종류({@link Command}, {@link Button} 등) 에 따라 실제 구현체의 타입이 달라집니다.
 * 자세한 것은 다른 Interaction({@link Command}, {@link Button}) 데코레이터를 참고하세요.
 */
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
