import { LikeDetails } from '../schemas/like-details.schema';
import { LikeDetailsDtoSql } from '../../../blogger-platform-sql/common/dto/like-details.dto.sql';

import { LikeDetailsViewRowWrap } from '../../../blogger-platform-wrap/common/dto/like-details.view-row.wrap';

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

  static mapToViewWrap(row: LikeDetailsViewRowWrap): LikeDetailsViewDto {
    const dto = new LikeDetailsViewDto();

    dto.addedAt = new Date(row.added_at).toISOString();
    dto.userId = row.user_id.toString();
    dto.login = row.login;

    return dto;
  }
}
