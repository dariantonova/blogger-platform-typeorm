import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepositoryWrap } from '../../infrastructure/comments.repository.wrap';

export class DeleteCommentCommandWrap {
  constructor(
    public commentId: string,
    public currentUserId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommandWrap)
export class DeleteCommentUseCaseWrap
  implements ICommandHandler<DeleteCommentCommandWrap>
{
  constructor(private commentsRepository: CommentsRepositoryWrap) {}

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
  }
}
