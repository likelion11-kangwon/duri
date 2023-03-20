import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
} from 'discord.js';
import { inject } from 'inversify';
import { Button } from '../interaction/button.js';
import { Command } from '../interaction/command.js';
import { Interaction } from '../interaction/interaction.js';
import { Option } from '../interaction/option.js';
import { Controller } from '../module/controller.js';
import { PingService, PingServiceSymbol } from './ping.service.js';

@Controller()
export class PingController {
  constructor(
    @inject(PingServiceSymbol)
    private readonly pingService: PingService,
  ) {}

  @Command('ping', '핑을 쏩니다')
  async ping(@Interaction() interaction: ChatInputCommandInteraction) {
    // Ping의 결과를 불러온다
    const response = this.pingService.ping();

    // Ping again 버튼을 생성한다.
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ping-again')
        .setLabel('Ping again!')
        .setStyle(ButtonStyle.Primary),
    );
    // 메시지를 전송한다.
    await interaction.reply({
      content: response,
      components: [row],
    });
  }

  @Button('ping-again')
  async pingAgain(@Interaction() interaction: ButtonInteraction) {
    interaction.reply(this.pingService.pingAgain());
  }

  @Command('add', '숫자를 더합니다')
  async add(
    @Interaction() interaction: ChatInputCommandInteraction,
    @Option('a', Number, 'a', true) a: number,
    @Option('b', Number, 'b', true) b: number,
  ) {
    interaction.reply(`${a} + ${b} = ${a + b}`);
  }
}
