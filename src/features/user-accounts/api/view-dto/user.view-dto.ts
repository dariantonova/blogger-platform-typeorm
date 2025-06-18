import { OmitType } from '@nestjs/swagger';
import { UserViewRow } from '../../infrastructure/query/dto/user.view-row';

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
}

export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToViewWrap(row: UserViewRow): MeViewDto {
    const dto = new MeViewDto();

    dto.login = row.login;
    dto.email = row.email;
    dto.userId = row.id.toString();

    return dto;
  }
}
