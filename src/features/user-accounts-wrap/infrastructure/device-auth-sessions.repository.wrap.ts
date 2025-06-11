import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceAuthSessionWrap } from '../domain/device-auth-session.wrap';
import { isUpdateNeeded } from '../../wrap/utils/is-update-needed';
import { getNewValuesFromDtoToUpdate } from '../../wrap/utils/get-new-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../wrap/utils/build-update-set-clause';

@Injectable()
export class DeviceAuthSessionsRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(session: DeviceAuthSessionWrap): Promise<DeviceAuthSessionWrap> {
    if (!session.id) {
      await this.createDeviceAuthSession(session);
    } else if (isUpdateNeeded(session)) {
      await this.updateDeviceAuthSession(session);
    }

    return session;
  }

  async findByDeviceIdAndIat(
    deviceId: string,
    iat: Date,
  ): Promise<DeviceAuthSessionWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE d.device_id = $1
    AND d.iat = $2;
    `;
    const findResult = await this.dataSource.query(findQuery, [deviceId, iat]);

    return findResult[0]
      ? DeviceAuthSessionWrap.reconstitute(findResult[0])
      : null;
  }

  async findByDeviceId(
    deviceId: string,
  ): Promise<DeviceAuthSessionWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE d.device_id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [deviceId]);

    return findResult[0]
      ? DeviceAuthSessionWrap.reconstitute(findResult[0])
      : null;
  }

  async findByDeviceIdOrInternalFail(
    deviceId: string,
  ): Promise<DeviceAuthSessionWrap> {
    const deviceAuthSession = await this.findByDeviceId(deviceId);

    if (!deviceAuthSession) {
      throw new Error('Device auth session not found');
    }

    return deviceAuthSession;
  }

  async findByDeviceIdOrNotFoundFail(
    deviceId: string,
  ): Promise<DeviceAuthSessionWrap> {
    const deviceAuthSession = await this.findByDeviceId(deviceId);

    if (!deviceAuthSession) {
      throw new NotFoundException('Device auth session not found');
    }

    return deviceAuthSession;
  }

  async deleteUserDeviceAuthSessions(userId: string): Promise<void> {
    const deleteQuery = `
    DELETE FROM device_auth_sessions
    WHERE user_id = $1;
    `;
    await this.dataSource.query(deleteQuery, [+userId]);
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    const deleteQuery = `
    DELETE FROM device_auth_sessions
    WHERE device_id = $1;
    `;
    await this.dataSource.query(deleteQuery, [deviceId]);
  }

  async deleteUserDeviceAuthSessionsExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    const deleteQuery = `
    DELETE FROM device_auth_sessions
    WHERE user_id = $1
    AND device_id != $2;
    `;
    await this.dataSource.query(deleteQuery, [userId, currentDeviceId]);
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    d.id, d.device_id, d.user_id, d.exp, d.iat, d.device_name, d.ip
    FROM device_auth_sessions d
    `;
  }

  private async createDeviceAuthSession(
    session: DeviceAuthSessionWrap,
  ): Promise<DeviceAuthSessionWrap> {
    const createQuery = `
    INSERT INTO device_auth_sessions
    (device_id, user_id, exp, iat, device_name, ip)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      session.deviceId,
      session.userId,
      session.exp,
      session.iat,
      session.deviceName,
      session.ip,
    ]);

    session.id = createResult[0].id.toString();

    return session;
  }

  private async updateDeviceAuthSession(
    session: DeviceAuthSessionWrap,
  ): Promise<DeviceAuthSessionWrap> {
    const { id, dtoToUpdate } = session;
    const newValues = getNewValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE device_auth_sessions
    ${updateSetClause}
    WHERE id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);

    session.completeUpdate();

    return session;
  }
}
