import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MakeCommentLikeOperationDto } from '../../dto/make-comment-like-operation.dto';
import { CommentLike } from '../../domain/comment-like.entity';
import { CommentsRepo } from '../../../comments/infrastructure/comments.repo';
import { CommentLikesRepo } from '../../infrastructure/comment-likes.repo';

export class MakeCommentLikeOperationCommand {
  constructor(public dto: MakeCommentLikeOperationDto) {}
}

@CommandHandler(MakeCommentLikeOperationCommand)
export class MakeCommentLikeOperationUseCase
  implements ICommandHandler<MakeCommentLikeOperationCommand>
{
  constructor(
    private commentLikesRepository: CommentLikesRepo,
    private commentsRepository: CommentsRepo,
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
