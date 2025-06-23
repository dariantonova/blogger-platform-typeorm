import { OmitType } from '@nestjs/swagger';
import { UserViewRow } from '../../infrastructure/query/dto/user.view-row';
import { User } from '../../../typeorm/entities/user-accounts/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToViewWrap(row: UserViewRow): UserViewDto {
    const dto = new UserViewDto();

    dto.id = row.id.toString();
    dto.login = row.login;
    dto.email = row.email;
    dto.createdAt = row.created_at.toISOString();

    return dto;
  }

  static mapToViewEntity(entity: User): UserViewDto {
    const dto = new UserViewDto();

    dto.id = entity.id.toString();
    dto.login = entity.login;
    dto.email = entity.email;
    dto.createdAt = entity.createdAt.toISOString();

    return dto;
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToViewWrap(row: UserViewRow): MeViewDto {
    const dto = new MeViewDto();

    dto.userId = row.id.toString();
    dto.login = row.login;
    dto.email = row.email;

    return dto;
  }

  static mapToViewEntity(entity: User): MeViewDto {
    const dto = new MeViewDto();

    dto.userId = entity.id.toString();
    dto.login = entity.login;
    dto.email = entity.email;

    return dto;
  }
}
