import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsQueryRepository } from '../../infrastructure/query/device-auth-sessions.query-repository';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';

export class GetUserDeviceSessionsQuery {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserDeviceSessionsQuery)
export class GetUserDeviceSessionsQueryHandler
  implements IQueryHandler<GetUserDeviceSessionsQuery, DeviceViewDto[]>
{
  constructor(
    private deviceAuthSessionsQueryRepository: DeviceAuthSessionsQueryRepository,
  ) {}

  async execute({
    userId,
  }: GetUserDeviceSessionsQuery): Promise<DeviceViewDto[]> {
    return this.deviceAuthSessionsQueryRepository.findUserSessions(userId);
  }
}
