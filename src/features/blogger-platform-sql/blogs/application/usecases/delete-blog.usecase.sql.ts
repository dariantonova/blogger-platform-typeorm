import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositorySql } from '../../infrastructure/blogs.repository.sql';
import { PostsRepositorySql } from '../../../posts/infrastructure/posts.repository.sql';

export class DeleteBlogCommandSql {
  constructor(public blogId: number) {}
}

@CommandHandler(DeleteBlogCommandSql)
export class DeleteBlogUseCaseSql
  implements ICommandHandler<DeleteBlogCommandSql>
{
  constructor(
    private blogsRepository: BlogsRepositorySql,
    private postsRepository: PostsRepositorySql,
  ) {}

  async execute({ blogId }: DeleteBlogCommandSql): Promise<void> {
    await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    await this.postsRepository.softDeleteByBlogId(blogId);
    await this.blogsRepository.softDeleteById(blogId);
  }
}
