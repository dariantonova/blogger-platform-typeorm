import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikesRepo } from '../../../likes/infrastructure/comment-likes.repo';
import { CommentsRepo } from '../../infrastructure/comments.repo';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code';

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
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    comment.makeDeleted();

    await this.commentsRepository.save(comment);

    await this.commentLikesRepository.softDeleteByCommentId(commentId);
  }
}
