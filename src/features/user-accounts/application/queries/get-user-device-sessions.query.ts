import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';
import { DeviceAuthSessionsQueryRepository } from '../../infrastructure/query/device-auth-sessions.query-repository';

export class GetUserDeviceSessionsQuery {
  constructor(public userId: string) {}
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
