import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDtoSql } from '../../dto/create-post.dto.sql';
import { PostsRepositorySql } from '../../infrastructure/posts.repository.sql';
import { BlogsRepositorySql } from '../../../blogs/infrastructure/blogs.repository.sql';

export class CreatePostCommandSql {
  constructor(public dto: CreatePostDtoSql) {}
}

@CommandHandler(CreatePostCommandSql)
export class CreatePostUseCaseSql
  implements ICommandHandler<CreatePostCommandSql, number>
{
  constructor(
    private postsRepository: PostsRepositorySql,
    private blogsRepository: BlogsRepositorySql,
  ) {}

  async execute({ dto }: CreatePostCommandSql): Promise<number> {
    await this.blogsRepository.findByIdOrNotFoundFail(dto.blogId);

    return this.postsRepository.createPost(dto);
  }
}
