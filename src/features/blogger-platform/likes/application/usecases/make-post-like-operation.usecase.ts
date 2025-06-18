import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { PostLike } from '../../domain/post-like.entity';
import { MakePostLikeOperationDto } from '../../dto/make-post-like-operation.dto';

export class MakePostLikeOperationCommandWrap {
  constructor(public dto: MakePostLikeOperationDto) {}
}

@CommandHandler(MakePostLikeOperationCommandWrap)
export class MakePostLikeOperationUseCaseWrap
  implements ICommandHandler<MakePostLikeOperationCommandWrap>
{
  constructor(
    private postLikesRepository: PostLikesRepository,
    private postsRepository: PostsRepository,
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
