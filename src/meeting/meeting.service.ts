import { Service } from '../module/service.js';
import { Meeting } from './meeting.js';

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
