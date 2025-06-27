import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MakePostLikeOperationDto } from '../../dto/make-post-like-operation.dto';
import { PostLike } from '../../domain/post-like.entity';
import { PostsRepo } from '../../../posts/infrastructure/posts.repo';
import { PostLikesRepo } from '../../infrastructure/post-likes.repo';

export class MakePostLikeOperationCommandWrap {
  constructor(public dto: MakePostLikeOperationDto) {}
}

@CommandHandler(MakePostLikeOperationCommandWrap)
export class MakePostLikeOperationUseCaseWrap
  implements ICommandHandler<MakePostLikeOperationCommandWrap>
{
  constructor(
    private postLikesRepository: PostLikesRepo,
    private postsRepository: PostsRepo,
  ) {}

  async execute({ dto }: MakePostLikeOperationCommandWrap): Promise<void> {
    await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    let like = await this.postLikesRepository.findByUserAndPost(
      dto.userId,
      dto.postId,
    );

    if (like) {
      like.update({ status: dto.likeStatus });
    } else {
      like = PostLike.createInstance({
        postId: dto.postId,
        userId: dto.userId,
        status: dto.likeStatus,
      });
    }

    await this.postLikesRepository.save(like);
  }
}
