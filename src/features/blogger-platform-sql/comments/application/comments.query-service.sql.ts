import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { CommentDtoSql } from '../dto/comment.dto.sql';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentLikesQueryRepositorySql } from '../../likes/infrastructure/query/comment-likes.query-repository.sql';

@Injectable()
export class CommentsQueryServiceSql {
  constructor(
    private commentLikesQueryRepository: CommentLikesQueryRepositorySql,
  ) {}

  async mapCommentToView(
    comment: CommentDtoSql,
    currentUserId: number | undefined,
  ): Promise<CommentViewDto> {
    const myStatus = currentUserId
      ? await this.commentLikesQueryRepository.findCommentLikeStatus(
          comment.id,
          currentUserId,
        )
      : LikeStatus.None;

    return CommentViewDto.mapToView(comment, myStatus);
  }

  async mapPaginatedCommentsToView(
    paginatedComments: PaginatedViewDto<CommentDtoSql[]>,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const commentsViewDtos = await Promise.all(
      paginatedComments.items.map((comment) =>
        this.mapCommentToView(comment, currentUserId),
      ),
    );

    return {
      ...paginatedComments,
      items: commentsViewDtos,
    };
  }
}
