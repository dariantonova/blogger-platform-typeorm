import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MakeCommentLikeOperationDto } from '../../dto/make-comment-like-operation.dto';
import { CommentLikesRepository } from '../../infrastructure/comment-likes.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { CommentLike } from '../../../../typeorm/entities/blogger-platform/comment-like.entity';

export class MakeCommentLikeOperationCommand {
  constructor(public dto: MakeCommentLikeOperationDto) {}
}

@CommandHandler(MakeCommentLikeOperationCommand)
export class MakeCommentLikeOperationUseCase
  implements ICommandHandler<MakeCommentLikeOperationCommand>
{
  constructor(
    private commentLikesRepository: CommentLikesRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ dto }: MakeCommentLikeOperationCommand): Promise<void> {
    await this.commentsRepository.findByIdOrNotFoundFail(dto.commentId);

    let like = await this.commentLikesRepository.findByUserAndComment(
      dto.userId,
      dto.commentId,
    );

    if (like) {
      like.update({ status: dto.likeStatus });
    } else {
      like = CommentLike.createInstance({
        commentId: dto.commentId,
        userId: dto.userId,
        status: dto.likeStatus,
      });
    }

    await this.commentLikesRepository.save(like);
  }
}
