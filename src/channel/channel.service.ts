import { Service } from '../module/service.js';
import { Channel } from './channel.js';

export const ChannelServiceSymbol = Symbol('ChannelService');

export interface ChannelService {
  registerChannel(type: string, id: string): Promise<void>;
  unregisterChannelByType(type: string): Promise<void>;
  unregisterChannelById(id: string): Promise<void>;
  getChannel(type: string): Promise<Channel | null>;
}

@Service(ChannelServiceSymbol)
export class ChannelServiceImpl implements ChannelService {
  async registerChannel(type: string, id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async unregisterChannelByType(type: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async unregisterChannelById(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getChannel(type: string): Promise<Channel | null> {
    throw new Error('Method not implemented.');
  }
}
