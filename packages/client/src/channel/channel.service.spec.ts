import { ChannelService, ChannelServiceImpl } from './channel.service.js';

let channelService: ChannelService;

beforeEach(() => {
  channelService = new ChannelServiceImpl();
});

describe('registerChannel', () => {
  it('should be implemented', async () => {
    await channelService.registerChannel('test', '1234');
  });
});

describe('unregisterChannelByType', () => {
  it('should be implemented', async () => {
    await channelService.unregisterChannelByType('test');
  });
});

describe('unregisterChannelById', () => {
  it('should be implemented', async () => {
    await channelService.unregisterChannelById('1234');
  });
});

describe('getChannel', () => {
  it('should return channel', async () => {
    const channel = await channelService.getChannel('test');
    expect(channel).toBeDefined();
  });
});
