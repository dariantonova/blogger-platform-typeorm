import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateDeviceAuthSessionRepoDto } from './dto/create-device-auth-session.repo-dto';

@Injectable()
export class DeviceAuthSessionsRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async hardDeleteByUserId(userId: number): Promise<void> {
    const deleteQuery = `
    DELETE FROM device_auth_sessions d
    WHERE d.user_id = $1
    AND d.deleted_at IS NULL
    `;
    await this.dataSource.query(deleteQuery, [userId]);
  }

  async createDeviceAuthSession(
    dto: CreateDeviceAuthSessionRepoDto,
  ): Promise<void> {
    const createQuery = `
    INSERT INTO device_auth_sessions
    (device_id, user_id, exp, iat, device_name, ip)
    VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await this.dataSource.query(createQuery, [
      dto.deviceId,
      dto.userId,
      dto.exp,
      dto.iat,
      dto.deviceName,
      dto.ip,
    ]);
  }
}
