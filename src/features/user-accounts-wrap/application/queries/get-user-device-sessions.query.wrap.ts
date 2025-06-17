import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsQueryRepositoryWrap } from '../../infrastructure/query/device-auth-sessions.query-repository.wrap';
import { DeviceViewDto } from '../../../user-accounts/api/view-dto/device.view-dto';

export class GetUserDeviceSessionsQueryWrap {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserDeviceSessionsQueryWrap)
export class GetUserDeviceSessionsQueryHandlerWrap
  implements IQueryHandler<GetUserDeviceSessionsQueryWrap, DeviceViewDto[]>
{
  constructor(
    private deviceAuthSessionsQueryRepository: DeviceAuthSessionsQueryRepositoryWrap,
  ) {}

  async execute({
    userId,
  }: GetUserDeviceSessionsQueryWrap): Promise<DeviceViewDto[]> {
    return this.deviceAuthSessionsQueryRepository.findUserSessions(userId);
  }
}
