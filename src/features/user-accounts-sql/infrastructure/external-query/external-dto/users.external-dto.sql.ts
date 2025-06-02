import { UserDtoSql } from '../../../dto/user.dto.sql';

export class UserExternalDtoSql {
  id: number;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserDtoSql): UserExternalDtoSql {
    const dto = new UserExternalDtoSql();

    dto.id = user.id;
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }
}
