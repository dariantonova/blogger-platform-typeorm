import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommentsRepo } from '../../infrastructure/comments.repo';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code';

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
  constructor(private commentsRepository: CommentsRepo) {}

  async execute({
    commentId,
    dto,
    currentUserId,
  }: UpdateCommentCommandWrap): Promise<void> {
    const comment =
      await this.commentsRepository.findByIdOrNotFoundFail(commentId);

    if (currentUserId !== comment.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    comment.update(dto);

    await this.commentsRepository.save(comment);
  }
}
