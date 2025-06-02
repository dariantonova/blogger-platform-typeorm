import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MakePostLikeOperationDtoSql } from '../../dto/make-post-like-operation.dto.sql';
import { PostsRepositorySql } from '../../../posts/infrastructure/posts.repository.sql';
import { PostLikesRepositorySql } from '../../infrastructure/post-likes.repository.sql';

export class MakePostLikeOperationCommandSql {
  constructor(public dto: MakePostLikeOperationDtoSql) {}
}

@CommandHandler(MakePostLikeOperationCommandSql)
export class MakePostLikeOperationUseCaseSql
  implements ICommandHandler<MakePostLikeOperationCommandSql>
{
  constructor(
    private postLikesRepository: PostLikesRepositorySql,
    private postsRepository: PostsRepositorySql,
  ) {}

  async execute({ dto }: MakePostLikeOperationCommandSql): Promise<void> {
    await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    await this.postLikesRepository.updatePostLike(dto);
  }
}
