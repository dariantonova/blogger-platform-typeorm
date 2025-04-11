import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeModelType } from '../../../likes/domain/like.entity';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { MakeCommentLikeOperationDto } from '../../dto/make-comment-like-operation.dto';
import { CommentDocument } from '../../domain/comment.entity';

export class MakeCommentLikeOperationCommand {
  constructor(public dto: MakeCommentLikeOperationDto) {}
}

@CommandHandler(MakeCommentLikeOperationCommand)
export class MakeCommentLikeOperationUseCase
  implements ICommandHandler<MakeCommentLikeOperationCommand>
{
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    private likesRepository: LikesRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ dto }: MakeCommentLikeOperationCommand): Promise<void> {
    const comment = await this.commentsRepository.findByIdOrNotFoundFail(
      dto.commentId,
    );

    let like = await this.likesRepository.findByUserAndParent(
      dto.userId,
      dto.commentId,
    );

    if (like) {
      like.update({ status: dto.likeStatus });
    } else {
      like = this.LikeModel.createInstance({
        parentId: dto.commentId,
        userId: dto.userId,
        status: dto.likeStatus,
      });
    }

    await this.likesRepository.save(like);

    await this.updateCommentLikesInfo(comment);
  }

  private async updateCommentLikesInfo(
    comment: CommentDocument,
  ): Promise<void> {
    const { likesCount, dislikesCount } =
      await this.likesRepository.countLikesAndDislikesOfParent(comment.id);

    comment.updateLikesInfo({ likesCount, dislikesCount });

    await this.commentsRepository.save(comment);
  }
}
