import { MakePostLikeOperationDto } from '../../dto/make-post-like-operation.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../../../likes/domain/like.entity';
import { PostDocument } from '../../domain/post.entity';
import { LikeDetails } from '../../../common/schemas/like-details.schema';
import { UsersExternalQueryRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-query-repository';

export class MakePostLikeOperationCommand {
  constructor(public dto: MakePostLikeOperationDto) {}
}

@CommandHandler(MakePostLikeOperationCommand)
export class MakePostLikeOperationUseCase
  implements ICommandHandler<MakePostLikeOperationCommand>
{
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    private likesRepository: LikesRepository,
    private postsRepository: PostsRepository,
    private usersExternalQueryRepository: UsersExternalQueryRepository,
  ) {}

  async execute({ dto }: MakePostLikeOperationCommand): Promise<void> {
    const post = await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    let like = await this.likesRepository.findByUserAndParent(
      dto.userId,
      dto.postId,
    );

    if (like) {
      like.update({ status: dto.likeStatus });
    } else {
      like = this.LikeModel.createInstance({
        parentId: dto.postId,
        userId: dto.userId,
        status: dto.likeStatus,
      });
    }

    await this.likesRepository.save(like);

    await this.updatePostLikesInfo(post);
  }

  private async updatePostLikesInfo(post: PostDocument): Promise<void> {
    const likesCount = await this.likesRepository.countLikesOfParent(post.id);
    const dislikesCount = await this.likesRepository.countDislikesOfParent(
      post.id,
    );

    const newestLikes = await this.likesRepository.findNewestLikesOfParent(
      post.id,
      3,
    );
    const newestLikesDetails = await this.mapLikesToLikesDetails(newestLikes);

    post.updateExtendedLikesInfo({
      likesCount,
      dislikesCount,
      newestLikes: newestLikesDetails,
    });

    await this.postsRepository.save(post);
  }

  private async mapLikesToLikesDetails(
    likes: LikeDocument[],
  ): Promise<LikeDetails[]> {
    return Promise.all(
      likes.map(async (like) => {
        const user =
          await this.usersExternalQueryRepository.findByIdOrInternalFail(
            like.userId,
          );
        return {
          userId: like.userId,
          login: user.login,
          addedAt: like.createdAt,
        };
      }),
    );
  }
}
