import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentDtoSql } from '../../dto/create-comment.dto.sql';
import { PostsRepositorySql } from '../../../posts/infrastructure/posts.repository.sql';
import { UsersExternalQueryRepositorySql } from '../../../../user-accounts-sql/infrastructure/external-query/users.external-query-repository.sql';
import { CommentsRepositorySql } from '../../infrastructure/comments.repository.sql';

export class CreateCommentCommandSql {
  constructor(public dto: CreateCommentDtoSql) {}
}

@CommandHandler(CreateCommentCommandSql)
export class CreateCommentUseCaseSql
  implements ICommandHandler<CreateCommentCommandSql, number>
{
  constructor(
    private postsRepository: PostsRepositorySql,
    private usersExternalQueryRepository: UsersExternalQueryRepositorySql,
    private commentsRepository: CommentsRepositorySql,
  ) {}

  async execute({ dto }: CreateCommentCommandSql): Promise<number> {
    await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    await this.usersExternalQueryRepository.findByIdOrInternalFail(dto.userId);

    return this.commentsRepository.createComment(dto);
  }
}
