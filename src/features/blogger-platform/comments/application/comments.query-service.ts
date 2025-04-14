import { Injectable } from '@nestjs/common';
import { LikesQueryRepository } from '../../likes/infrastructure/query/likes.query-repository';
import { CommentDocument } from '../domain/comment.entity';
import { CommentViewDto } from '../api/view-dto/comments.view-dto';
import { LikeStatus } from '../../likes/dto/like-status';

@Injectable()
export class CommentsQueryService {
  constructor(private likesQueryRepository: LikesQueryRepository) {}

  async mapCommentToView(
    comment: CommentDocument,
    currentUserId: string | undefined,
  ): Promise<CommentViewDto> {
    const myStatus = currentUserId
      ? await this.likesQueryRepository.findLikeStatus(
          currentUserId,
          comment._id.toString(),
        )
      : LikeStatus.None;

    return CommentViewDto.mapToView(comment, myStatus);
  }
}
