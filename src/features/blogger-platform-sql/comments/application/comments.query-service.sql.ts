import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { CommentDtoSql } from '../dto/comment.dto.sql';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class CommentsQueryServiceSql {
  // constructor(private likesQueryRepository: LikesQueryRepository) {}

  async mapCommentToView(
    comment: CommentDtoSql,
    currentUserId: number | undefined,
  ): Promise<CommentViewDto> {
    // const myStatus = currentUserId
    //   ? await this.likesQueryRepository.findLikeStatus(
    //     currentUserId,
    //     comment._id.toString(),
    //   )
    //   : LikeStatus.None;
    // todo: find my status when likes feature is added
    const myStatus = LikeStatus.None;

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
