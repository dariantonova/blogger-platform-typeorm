import { LikeDetails } from '../schemas/like-details.schema';
import { LikeDetailsDtoSql } from '../../../blogger-platform-sql/common/dto/like-details.dto.sql';

export class LikeDetailsViewDto {
  addedAt: string;
  userId: string;
  login: string;

  static mapToView(likeDetails: LikeDetailsDtoSql): LikeDetailsViewDto {
    const dto = new LikeDetailsViewDto();

    dto.addedAt = likeDetails.addedAt.toISOString();
    dto.userId = likeDetails.userId.toString();
    dto.login = likeDetails.login;

    return dto;
  }

  static mapToViewMongo(likeDetails: LikeDetails): LikeDetailsViewDto {
    const dto = new LikeDetailsViewDto();

    dto.addedAt = likeDetails.addedAt.toISOString();
    dto.userId = likeDetails.userId;
    dto.login = likeDetails.login;

    return dto;
  }
}
