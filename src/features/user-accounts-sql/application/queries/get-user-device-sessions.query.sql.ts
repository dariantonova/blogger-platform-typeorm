import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceViewDto } from '../../../user-accounts/api/view-dto/device.view-dto';
import { DeviceAuthSessionsQueryRepositorySql } from '../../infrastructure/query/device-auth-sessions.query-repository.sql';

export class GetUserDeviceSessionsQuerySql {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserDeviceSessionsQuerySql)
export class GetUserDeviceSessionsQueryHandlerSql
  implements IQueryHandler<GetUserDeviceSessionsQuerySql, DeviceViewDto[]>
{
  constructor(
    private deviceAuthSessionsQueryRepository: DeviceAuthSessionsQueryRepositorySql,
  ) {}

  async execute({
    userId,
  }: GetUserDeviceSessionsQuerySql): Promise<DeviceViewDto[]> {
    return this.deviceAuthSessionsQueryRepository.findUserSessions(userId);
  }
}
