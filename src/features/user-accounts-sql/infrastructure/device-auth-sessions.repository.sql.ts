import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
}
