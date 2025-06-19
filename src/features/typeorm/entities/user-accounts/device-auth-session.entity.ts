import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Unique(['userId', 'deviceId'])
export class DeviceAuthSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'timestamp with time zone' })
  exp: Date;

  @Column({ type: 'timestamp with time zone' })
  iat: Date;

  @Column()
  deviceName: string;

  @Column()
  ip: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  // static createInstance(
  //   dto: CreateDeviceAuthSessionDomainDto,
  // ): DeviceAuthSession {
  //   const session = new DeviceAuthSession();
  //
  //   session.deviceId = dto.deviceId;
  //   session.userId = dto.userId;
  //   session.exp = dto.exp;
  //   session.iat = dto.iat;
  //   session.deviceName = dto.deviceName;
  //   session.ip = dto.ip;
  //
  //   return session;
  // }
  //
  // static reconstitute(row: DeviceAuthSessionRow): DeviceAuthSession {
  //   const session = new DeviceAuthSession();
  //
  //   session.id = row.id;
  //   session.deviceId = row.device_id;
  //   session.userId = row.user_id;
  //   session.exp = row.exp;
  //   session.iat = row.iat;
  //   session.deviceName = row.device_name;
  //   session.ip = row.ip;
  //
  //   return session;
  // }
  //
  // update(dto: UpdateDeviceAuthSessionDomainDto) {
  //   this.exp = dto.exp;
  //   this.iat = dto.iat;
  //   this.ip = dto.ip;
  // }
}
