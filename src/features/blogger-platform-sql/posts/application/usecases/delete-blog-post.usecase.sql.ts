import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositorySql } from '../../infrastructure/posts.repository.sql';

export class DeleteBlogPostCommandSql {
  constructor(
    public blogId: number,
    public postId: number,
  ) {}
}

@CommandHandler(DeleteBlogPostCommandSql)
export class DeleteBlogPostUseCaseSql
  implements ICommandHandler<DeleteBlogPostCommandSql>
{
  constructor(private postsRepository: PostsRepositorySql) {}

  async execute({ blogId, postId }: DeleteBlogPostCommandSql): Promise<void> {
    await this.postsRepository.findByIdAndBlogIdOrNotFoundFail(postId, blogId);

    // todo: delete likes, comments with their likes
    await this.postsRepository.softDeleteByIdAndBlogId(postId, blogId);
  }
}
