import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModelType,
} from '../../domain/device-auth-session.entity';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';

@Injectable()
export class DeviceAuthSessionsQueryRepository {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private DeviceAuthSessionModel: DeviceAuthSessionModelType,
  ) {}

  async findUserSessions(userId: string): Promise<DeviceViewDto[]> {
    const deviceAuthSessions = await this.DeviceAuthSessionModel.find({
      userId,
    }).sort({ _id: 1 });

    return deviceAuthSessions.map(DeviceViewDto.mapToView);
  }
}
