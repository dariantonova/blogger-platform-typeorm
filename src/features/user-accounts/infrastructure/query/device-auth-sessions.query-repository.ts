import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';

@Injectable()
export class DeviceAuthSessionsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUserSessions(userId: number): Promise<DeviceViewDto[]> {
    const findQuery = `
    SELECT
    d.ip, d.device_name, d.iat, d.device_id
    FROM device_auth_sessions d
    WHERE d.user_id = $1
    ORDER BY d.id;
    `;
    const findResult = await this.dataSource.query(findQuery, [userId]);

    return findResult.map(DeviceViewDto.mapToViewWrap);
  }
}
