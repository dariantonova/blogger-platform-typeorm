import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepositoryWrap } from '../../infrastructure/comments.repository.wrap';
import { UpdateCommentDto } from '../../../../blogger-platform/comments/dto/update-comment.dto';

export class UpdateCommentCommandWrap {
  constructor(
    public commentId: string,
    public dto: UpdateCommentDto,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommandWrap)
export class UpdateCommentUseCaseWrap
  implements ICommandHandler<UpdateCommentCommandWrap>
{
  constructor(private commentsRepository: CommentsRepositoryWrap) {}

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
