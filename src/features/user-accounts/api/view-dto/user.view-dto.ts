import { OmitType } from '@nestjs/swagger';
import { User } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

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

  static mapToViewEntity(entity: User): MeViewDto {
    const dto = new MeViewDto();

    dto.userId = entity.id.toString();
    dto.login = entity.login;
    dto.email = entity.email;

    return dto;
  }
}
