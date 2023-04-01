import {
  Command,
  Controller,
  Interaction,
  Option,
  Button,
} from '@likelion/bot';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
} from 'discord.js';
import { inject } from 'inversify';
import { Meeting } from './meeting.js';
import { MeetingService, MeetingServiceSymbol } from './meeting.service.js';

@Controller()
export class MeetingController {
  constructor(
    @inject(MeetingServiceSymbol)
    private readonly meetingService: MeetingService,
  ) {}

  @Command('create', '미팅을 만듭니다')
  async createMeeting(
    @Interaction() interaction: ChatInputCommandInteraction,
    @Option('place', String, '장소', true) place: string,
    @Option('slots', Number, '최대 인원', true) slots: number,
    @Option('time', String, '시작 시간', true) time: string,
  ) {
    const data: Pick<Meeting, 'place' | 'slots' | 'time'> = {
      place: place,
      slots: slots,
      time: time,
    };
    if (slots <= 0) {
      await interaction.reply({
        content: 'create fail : slots must be positive number.',
      });
      throw new Error('slots is invalid. Input positive number');
    }

    const timeRegex = /\d{1,2}월\s*\d{1,2}일\s*\d{1,2}시\s*\d{1,2}분/;
    if (!timeRegex.test(time)) {
      await interaction.reply({
        content:
          'create fail : Time is an invalid input format.\nFollow this format => ~월 ~일 ~시 ~분',
      });
      throw new Error('time is invalid. Input correct format');
    }

    const response = await this.meetingService.createMeeting(data);

    await interaction.reply({
      content: response,
    });
  }
}
