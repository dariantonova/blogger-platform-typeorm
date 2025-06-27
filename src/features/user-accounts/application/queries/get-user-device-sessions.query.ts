import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';
import { DeviceAuthSessionsQueryRepo } from '../../infrastructure/query/device-auth-sessions.query-repo';

export class GetUserDeviceSessionsQuery {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserDeviceSessionsQuery)
export class GetUserDeviceSessionsQueryHandler
  implements IQueryHandler<GetUserDeviceSessionsQuery, DeviceViewDto[]>
{
  constructor(
    private deviceAuthSessionsQueryRepository: DeviceAuthSessionsQueryRepo,
  ) {}

  async execute({
    userId,
  }: GetUserDeviceSessionsQuery): Promise<DeviceViewDto[]> {
    return this.deviceAuthSessionsQueryRepository.findUserSessions(userId);
  }
}
