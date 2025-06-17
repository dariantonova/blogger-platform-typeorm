import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikesRepositoryWrap } from '../../infrastructure/comment-likes.repository.wrap';
import { CommentsRepositoryWrap } from '../../../comments/infrastructure/comments.repository.wrap';
import { CommentLikeWrap } from '../../domain/comment-like.wrap';
import { MakeCommentLikeOperationDtoSql } from '../../../../blogger-platform-sql/likes/dto/make-comment-like-operation.dto.sql';

export class MakeCommentLikeOperationCommandWrap {
  constructor(public dto: MakeCommentLikeOperationDtoSql) {}
}

@CommandHandler(MakeCommentLikeOperationCommandWrap)
export class MakeCommentLikeOperationUseCaseWrap
  implements ICommandHandler<MakeCommentLikeOperationCommandWrap>
{
  constructor(
    private commentLikesRepository: CommentLikesRepositoryWrap,
    private commentsRepository: CommentsRepositoryWrap,
  ) {}

  async execute({ dto }: MakeCommentLikeOperationCommandWrap): Promise<void> {
    await this.commentsRepository.findByIdOrNotFoundFail(dto.commentId);

    let like = await this.commentLikesRepository.findByUserAndComment(
      dto.userId,
      dto.commentId,
    );

    if (like) {
      like.update({ status: dto.likeStatus });
    } else {
      like = CommentLikeWrap.createInstance({
        commentId: dto.commentId,
        userId: dto.userId,
        status: dto.likeStatus,
      });
    }

    await this.commentLikesRepository.save(like);
  }
}
