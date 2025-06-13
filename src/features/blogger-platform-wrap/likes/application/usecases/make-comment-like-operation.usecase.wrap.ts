import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MakeCommentLikeOperationDto } from '../../../../blogger-platform/comments/dto/make-comment-like-operation.dto';
import { CommentLikesRepositoryWrap } from '../../infrastructure/comment-likes.repository.wrap';
import { CommentsRepositoryWrap } from '../../../comments/infrastructure/comments.repository.wrap';
import { CommentLikeWrap } from '../../domain/comment-like.wrap';

export class MakeCommentLikeOperationCommandWrap {
  constructor(public dto: MakeCommentLikeOperationDto) {}
}

@CommandHandler(MakeCommentLikeOperationCommandWrap)
export class MakeCommentLikeOperationUseCaseWrap
  implements ICommandHandler<MakeCommentLikeOperationCommandWrap>
{
  constructor(
    private commentLikesRepository: CommentLikesRepositoryWrap,
    private commentsRepository: CommentsRepositoryWrap,
  ) {}

  async execute({ dto }: MakeCommentLikeOperationCommandWrap): Promise<void> {
    await this.commentsRepository.findByIdOrNotFoundFail(dto.commentId);

    let like = await this.commentLikesRepository.findByUserAndComment(
      dto.userId,
      dto.commentId,
    );

    if (like) {
      like.update({ status: dto.likeStatus });
    } else {
      like = CommentLikeWrap.createInstance({
        commentId: dto.commentId,
        userId: dto.userId,
        status: dto.likeStatus,
      });
    }

    await this.commentLikesRepository.save(like);
  }
}
