import { Service } from '@likelion/bot';
import { Meeting } from '@prisma/client';

export const MeetingServiceSymbol = Symbol('MeetingService');

export interface MeetingService {
  createMeeting(
    data: Pick<Meeting, 'place' | 'slots' | 'time'>,
  ): Promise<string>;

  addMemberToMeeting(meeting: Meeting, memberName: string): Promise<void>;

  removeMemberFromMeeting(meeting: Meeting, memberName: string): Promise<void>;

  getLastMeeting(): Promise<Meeting>;

  cancelLastMeeting(meeting: Meeting): Promise<void>;
}

@Service(MeetingServiceSymbol)
export class MeetingServiceImpl implements MeetingService {
  async createMeeting(
    data: Pick<Meeting, 'place' | 'slots' | 'time'>,
  ): Promise<string> {
    console.log(data);
    return '123';

    throw new Error('Method not implemented.');
  }

  async addMemberToMeeting(
    meeting: Meeting,
    memberName: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async removeMemberFromMeeting(
    meeting: Meeting,
    memberName: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getLastMeeting(): Promise<Meeting> {
    throw new Error('Method not implemented.');
  }

  async cancelLastMeeting(meeting: Meeting): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
