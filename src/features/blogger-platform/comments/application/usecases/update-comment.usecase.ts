import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UpdateCommentDto } from '../../dto/update-comment.dto';

export class UpdateCommentCommandWrap {
  constructor(
    public commentId: number,
    public dto: UpdateCommentDto,
    public currentUserId: number,
  ) {}
}

@CommandHandler(UpdateCommentCommandWrap)
export class UpdateCommentUseCaseWrap
  implements ICommandHandler<UpdateCommentCommandWrap>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({
    commentId,
    dto,
    currentUserId,
  }: UpdateCommentCommandWrap): Promise<void> {
    const comment =
      await this.commentsRepository.findByIdOrNotFoundFail(commentId);

    if (currentUserId !== comment.userId) {
      throw new ForbiddenException();
    }

    comment.update(dto);

    await this.commentsRepository.save(comment);
  }
}
