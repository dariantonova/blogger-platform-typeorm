import { CommentatorInfoViewDto } from './commentator-info.view-dto';
import { BaseLikesInfoViewDto } from '../../../common/dto/base-likes-info.view-dto';
import { CommentDocument } from '../../domain/comment.entity';
import { LikeStatus } from '../../../likes/dto/like-status';
import { CommentDtoSql } from '../../../../blogger-platform-sql/comments/dto/comment.dto.sql';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoViewDto;
  createdAt: string;
  likesInfo: BaseLikesInfoViewDto;

  static mapToView(
    comment: CommentDtoSql,
    myStatus: LikeStatus,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = CommentatorInfoViewDto.mapToView(
      comment.commentatorInfo,
    );
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = BaseLikesInfoViewDto.mapToView(comment.likesInfo, myStatus);

    return dto;
  }

  static mapToViewMongo(
    comment: CommentDocument,
    myStatus: LikeStatus,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = CommentatorInfoViewDto.mapToViewMongo(
      comment.commentatorInfo,
    );
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = BaseLikesInfoViewDto.mapToViewMongo(
      comment.likesInfo,
      myStatus,
    );

    return dto;
  }
}
