import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByDeviceIdAndIatAndUserId(
    deviceId: string,
    iat: Date,
    userId: number,
  ): Promise<DeviceAuthSessionDtoSql | null> {
    const findQuery = `
    SELECT
    d.id, d.device_id, d.user_id, d.exp, d.iat, d.device_name, d.ip
    FROM device_auth_sessions d
    WHERE d.device_id = $1
    AND d.iat = $2
    AND d.user_id = $3;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      deviceId,
      iat,
      userId,
    ]);

    return findResult[0] ? mapDeviceAuthSessionRowToDto(findResult[0]) : null;
  }

  async updateDeviceAuthSession(
    userId: number,
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
    WHERE device_id = $4
    AND user_id = $5;
    `;
    await this.dataSource.query(updateQuery, [exp, iat, ip, deviceId, userId]);
  }

  async hardDeleteByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<void> {
    const deleteQuery = `
    DELETE FROM device_auth_sessions
    WHERE device_id = $1
    AND user_id = $2;
    `;
    await this.dataSource.query(deleteQuery, [deviceId, userId]);
  }

  async findByDeviceId(
    deviceId: string,
  ): Promise<DeviceAuthSessionDtoSql | null> {
    const findQuery = `
    SELECT
    d.id, d.device_id, d.user_id, d.exp, d.iat, d.device_name, d.ip
    FROM device_auth_sessions d
    WHERE d.device_id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [deviceId]);

    return findResult[0] ? mapDeviceAuthSessionRowToDto(findResult[0]) : null;
  }

  async findByDeviceIdOrNotFoundFail(
    deviceId: string,
  ): Promise<DeviceAuthSessionDtoSql> {
    const session = await this.findByDeviceId(deviceId);

    if (!session) {
      throw new NotFoundException('Device auth session not found');
    }

    return session;
  }

  async findManyByDeviceId(
    deviceId: string,
  ): Promise<DeviceAuthSessionDtoSql[]> {
    const findQuery = `
    SELECT
    d.id, d.device_id, d.user_id, d.exp, d.iat, d.device_name, d.ip
    FROM device_auth_sessions d
    WHERE d.device_id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [deviceId]);

    return findResult.map(mapDeviceAuthSessionRowToDto);
  }

  async hardDeleteUserDeviceAuthSessionsExceptCurrent(
    userId: number,
    currentDeviceId: string,
  ): Promise<void> {
    const deleteQuery = `
    DELETE FROM device_auth_sessions
    WHERE user_id = $1
    AND device_id != $2;
    `;
    await this.dataSource.query(deleteQuery, [userId, currentDeviceId]);
  }
}
