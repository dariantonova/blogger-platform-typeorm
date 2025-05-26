import { OmitType } from '@nestjs/swagger';
import { UserDtoSql } from '../../dto/user.dto.sql';

export class UserViewDtoSql {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(user: UserDtoSql): UserViewDtoSql {
    const dto = new UserViewDtoSql();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  }
}

export class MeViewDtoSql extends OmitType(UserViewDtoSql, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user: UserDtoSql): MeViewDtoSql {
    const dto = new MeViewDtoSql();

    dto.login = user.login;
    dto.email = user.email;
    dto.userId = user.id.toString();

    return dto;
  }
}
