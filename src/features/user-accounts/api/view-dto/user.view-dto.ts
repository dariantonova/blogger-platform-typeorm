import { UserDocument } from '../../domain/user.entity';
import { OmitType } from '@nestjs/swagger';
import { UserDtoSql } from '../../../user-accounts-sql/dto/user.dto.sql';
import { UserViewRowWrap } from '../../../user-accounts-wrap/infrastructure/query/dto/user.view-row.wrap';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(user: UserDtoSql): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  }

  static mapToViewMongo(user: UserDocument): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  }

  static mapToViewWrap(user: UserViewRowWrap): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.created_at.toISOString();

    return dto;
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user: UserDtoSql): MeViewDto {
    const dto = new MeViewDto();

    dto.login = user.login;
    dto.email = user.email;
    dto.userId = user.id.toString();

    return dto;
  }

  static mapToViewMongo(user: UserDocument): MeViewDto {
    const dto = new MeViewDto();

    dto.login = user.login;
    dto.email = user.email;
    dto.userId = user._id.toString();

    return dto;
  }

  static mapToViewWrap(user: UserViewRowWrap): MeViewDto {
    const dto = new MeViewDto();

    dto.login = user.login;
    dto.email = user.email;
    dto.userId = user.id.toString();

    return dto;
  }
}
