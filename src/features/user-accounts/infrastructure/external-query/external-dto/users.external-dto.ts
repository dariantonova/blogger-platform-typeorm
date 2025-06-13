import { UserDocument } from '../../../domain/user.entity';
import { UserViewRowWrap } from '../../../../user-accounts-wrap/infrastructure/query/dto/user.view-row.wrap';

export class UserExternalDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(user: UserDocument): UserExternalDto {
    const dto = new UserExternalDto();

    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  }

  static mapToViewWrap(row: UserViewRowWrap): UserExternalDto {
    const dto = new UserExternalDto();

    dto.id = row.id.toString();
    dto.login = row.login;
    dto.email = row.email;
    dto.createdAt = row.created_at.toISOString();

    return dto;
  }
}
