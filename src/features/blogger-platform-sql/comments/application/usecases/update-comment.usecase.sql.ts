import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepositorySql } from '../../infrastructure/comments.repository.sql';
import { UpdateCommentDto } from '../../../../blogger-platform/comments/dto/update-comment.dto';

export class UpdateCommentCommandSql {
  constructor(
    public commentId: number,
    public dto: UpdateCommentDto,
    public currentUserId: number,
  ) {}
}

@CommandHandler(UpdateCommentCommandSql)
export class UpdateCommentUseCaseSql
  implements ICommandHandler<UpdateCommentCommandSql>
{
  constructor(private commentsRepository: CommentsRepositorySql) {}

  async execute({
    commentId,
    dto,
    currentUserId,
  }: UpdateCommentCommandSql): Promise<void> {
    const comment =
      await this.commentsRepository.findByIdOrNotFoundFail(commentId);

    if (currentUserId !== comment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }

    await this.commentsRepository.updateComment(commentId, dto);
  }
}
