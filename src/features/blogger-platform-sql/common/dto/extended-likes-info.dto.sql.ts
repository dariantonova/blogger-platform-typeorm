import { BaseLikesInfoDtoSql } from './base-likes-info.dto.sql';
import { LikeDetailsDtoSql } from './like-details.dto.sql';

export class ExtendedLikesInfoDtoSql extends BaseLikesInfoDtoSql {
  newestLikes: LikeDetailsDtoSql[];
}
