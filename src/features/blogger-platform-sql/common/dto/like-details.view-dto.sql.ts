import { LikeDetailsDtoSql } from './like-details.dto.sql';

export class LikeDetailsViewDtoSql {
  addedAt: string;
  userId: string;
  login: string;

  static mapToView(likeDetails: LikeDetailsDtoSql): LikeDetailsViewDtoSql {
    const dto = new LikeDetailsViewDtoSql();

    dto.addedAt = likeDetails.addedAt.toISOString();
    dto.userId = likeDetails.userId.toString();
    dto.login = likeDetails.login;

    return dto;
  }
}
