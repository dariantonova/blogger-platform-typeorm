import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateDeviceAuthSessionRepoDto } from './dto/create-device-auth-session.repo-dto';
import { DeviceAuthSessionDtoSql } from '../dto/device-auth-session.dto.sql';
import { mapDeviceAuthSessionRowToDto } from './mappers/device-auth-session.mapper';

@Injectable()
export class DeviceAuthSessionsRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async hardDeleteByUserId(userId: number): Promise<void> {
    const deleteQuery = `
    DELETE FROM device_auth_sessions
    WHERE user_id = $1;
    `;
    await this.dataSource.query(deleteQuery, [userId]);
  }

  async createDeviceAuthSession(
    dto: CreateDeviceAuthSessionRepoDto,
  ): Promise<void> {
    const createQuery = `
    INSERT INTO device_auth_sessions
    (device_id, user_id, exp, iat, device_name, ip)
    VALUES ($1, $2, $3, $4, $5, $6);
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

  async findByDeviceIdAndIat(
    deviceId: string,
    iat: Date,
  ): Promise<DeviceAuthSessionDtoSql | null> {
    const findQuery = `
    SELECT
    d.id, d.device_id, d.user_id, d.exp, d.iat, d.device_name, d.ip
    FROM device_auth_sessions d
    WHERE d.device_id = $1
    AND d.iat = $2;
    `;
    const findResult = await this.dataSource.query(findQuery, [deviceId, iat]);

    return findResult[0] ? mapDeviceAuthSessionRowToDto(findResult[0]) : null;
  }

  async updateDeviceAuthSession(
    deviceId: string,
    exp: Date,
    iat: Date,
    ip: string,
  ): Promise<void> {
    const updateQuery = `
    UPDATE device_auth_sessions
    SET exp = $1,
        iat = $2,
        ip = $3
    WHERE device_id = $4;
    `;
    await this.dataSource.query(updateQuery, [exp, iat, ip, deviceId]);
  }
}
