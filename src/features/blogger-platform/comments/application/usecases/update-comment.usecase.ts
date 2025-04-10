import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public dto: UpdateCommentDto,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({
    commentId,
    dto,
    currentUserId,
  }: UpdateCommentCommand): Promise<void> {
    const comment =
      await this.commentsRepository.findByIdOrNotFoundFail(commentId);

    if (currentUserId !== comment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }

    comment.update(dto);

    await this.commentsRepository.save(comment);
  }
}
