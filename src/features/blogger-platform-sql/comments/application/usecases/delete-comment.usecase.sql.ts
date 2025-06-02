import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepositorySql } from '../../infrastructure/comments.repository.sql';

export class DeleteCommentCommandSql {
  constructor(
    public commentId: number,
    public currentUserId: number,
  ) {}
}

@CommandHandler(DeleteCommentCommandSql)
export class DeleteCommentUseCaseSql
  implements ICommandHandler<DeleteCommentCommandSql>
{
  constructor(private commentsRepository: CommentsRepositorySql) {}

  async execute({
    commentId,
    currentUserId,
  }: DeleteCommentCommandSql): Promise<void> {
    const comment =
      await this.commentsRepository.findByIdOrNotFoundFail(commentId);

    if (currentUserId !== comment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }

    await this.commentsRepository.softDeleteById(commentId);
  }
}
