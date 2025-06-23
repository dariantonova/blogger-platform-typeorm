import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceAuthSession } from '../../../entities/user-accounts/device-auth-session.entity';
import { Repository } from 'typeorm';
import { DeviceViewDto } from '../../../../user-accounts/api/view-dto/device.view-dto';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';

@Injectable()
export class DeviceAuthSessionsQueryRepo {
  constructor(
    @InjectRepository(DeviceAuthSession)
    private deviceAuthSessionsRepository: Repository<DeviceAuthSession>,
  ) {}

  async findUserSessions(userId: number): Promise<DeviceViewDto[]> {
    const sessions = await this.deviceAuthSessionsRepository.find({
      where: { userId },
      order: { id: SortDirection.Asc },
    });

    return sessions.map(DeviceViewDto.mapToViewEntity);
  }
}
