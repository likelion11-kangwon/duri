import { Service } from '@likelion/bot/src/module/service.js';

export const PingServiceSymbol = Symbol('PingService');

export interface PingService {
  ping(): string;
  pingAgain(): string;
}

@Service(PingServiceSymbol)
export class PingServiceImpl implements PingService {
  ping(): string {
    return 'Pong!';
  }

  pingAgain(): string {
    return 'Pong again!';
  }
}
