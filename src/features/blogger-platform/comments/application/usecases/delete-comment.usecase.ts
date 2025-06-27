import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentLikesRepo } from '../../../likes/infrastructure/comment-likes.repo';
import { CommentsRepo } from '../../infrastructure/comments.repo';

export class DeleteCommentCommandWrap {
  constructor(
    public commentId: number,
    public currentUserId: number,
  ) {}
}

@CommandHandler(DeleteCommentCommandWrap)
export class DeleteCommentUseCaseWrap
  implements ICommandHandler<DeleteCommentCommandWrap>
{
  constructor(
    private commentsRepository: CommentsRepo,
    private commentLikesRepository: CommentLikesRepo,
  ) {}

  async execute({
    commentId,
    currentUserId,
  }: DeleteCommentCommandWrap): Promise<void> {
    const comment =
      await this.commentsRepository.findByIdOrNotFoundFail(commentId);

    if (currentUserId !== comment.userId) {
      throw new ForbiddenException();
    }

    comment.makeDeleted();

    await this.commentsRepository.save(comment);

    await this.commentLikesRepository.softDeleteByCommentId(commentId);
  }
}
