import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceViewDtoSql } from '../../api/view-dto/device.view-dto.sql';
import { mapDeviceAuthSessionRowToDto } from '../mappers/device-auth-session.mapper';

@Injectable()
export class DeviceAuthSessionsQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUserSessions(userId: number): Promise<DeviceViewDtoSql[]> {
    const findQuery = `
    SELECT
    d.id, d.device_id, d.user_id, d.exp, d.iat, d.device_name, d.ip
    FROM device_auth_sessions d
    WHERE d.user_id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [userId]);

    const sessions = findResult.map(mapDeviceAuthSessionRowToDto);
    return sessions.map(DeviceViewDtoSql.mapToView);
  }
}
