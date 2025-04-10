import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public currentUserId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({
    commentId,
    currentUserId,
  }: DeleteCommentCommand): Promise<void> {
    const comment =
      await this.commentsRepository.findByIdOrNotFoundFail(commentId);

    if (currentUserId !== comment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }

    comment.makeDeleted();

    await this.commentsRepository.save(comment);
  }
}
