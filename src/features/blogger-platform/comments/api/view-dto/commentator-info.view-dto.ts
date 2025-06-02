import { CommentatorInfo } from '../../domain/commentator-info.schema';
import { CommentatorInfoDtoSql } from '../../../../blogger-platform-sql/comments/dto/commentator-info.dto.sql';

export class CommentatorInfoViewDto {
  userId: string;
  userLogin: string;

  static mapToView(
    commentatorInfo: CommentatorInfoDtoSql,
  ): CommentatorInfoViewDto {
    const dto = new CommentatorInfoViewDto();

    dto.userId = commentatorInfo.userId.toString();
    dto.userLogin = commentatorInfo.userLogin;

    return dto;
  }

  static mapToViewMongo(
    commentatorInfo: CommentatorInfo,
  ): CommentatorInfoViewDto {
    const dto = new CommentatorInfoViewDto();

    dto.userId = commentatorInfo.userId;
    dto.userLogin = commentatorInfo.userLogin;

    return dto;
  }
}
