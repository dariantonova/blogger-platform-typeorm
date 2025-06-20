import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { CreateDeviceAuthSessionDomainDto } from '../../../user-accounts/domain/dto/create-device-auth-session.domain-dto';
import { UpdateDeviceAuthSessionDomainDto } from '../../../user-accounts/domain/dto/update-device-auth-session.domain.dto';

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

  static createInstance(
    dto: CreateDeviceAuthSessionDomainDto,
  ): DeviceAuthSession {
    const session = new DeviceAuthSession();

    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.exp = dto.exp;
    session.iat = dto.iat;
    session.deviceName = dto.deviceName;
    session.ip = dto.ip;

    return session;
  }

  update(dto: UpdateDeviceAuthSessionDomainDto) {
    this.exp = dto.exp;
    this.iat = dto.iat;
    this.ip = dto.ip;
  }
}
