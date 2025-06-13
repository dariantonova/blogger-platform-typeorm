import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesRepositoryWrap } from '../../infrastructure/post-likes.repository.wrap';
import { PostsRepositoryWrap } from '../../../posts/infrastructure/posts.repository.wrap';
import { MakePostLikeOperationDto } from '../../../../blogger-platform/posts/dto/make-post-like-operation.dto';
import { PostLikeWrap } from '../../domain/post-like.wrap';

export class MakePostLikeOperationCommandWrap {
  constructor(public dto: MakePostLikeOperationDto) {}
}

@CommandHandler(MakePostLikeOperationCommandWrap)
export class MakePostLikeOperationUseCaseWrap
  implements ICommandHandler<MakePostLikeOperationCommandWrap>
{
  constructor(
    private postLikesRepository: PostLikesRepositoryWrap,
    private postsRepository: PostsRepositoryWrap,
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
      like = PostLikeWrap.createInstance({
        postId: dto.postId,
        userId: dto.userId,
        status: dto.likeStatus,
      });
    }

    await this.postLikesRepository.save(like);
  }
}
