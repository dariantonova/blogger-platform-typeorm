import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogPostDtoSql } from '../../dto/update-blog-post.dto.sql';
import { PostsRepositorySql } from '../../infrastructure/posts.repository.sql';

export class UpdateBlogPostCommandSql {
  constructor(
    public blogId: number,
    public postId: number,
    public dto: UpdateBlogPostDtoSql,
  ) {}
}

@CommandHandler(UpdateBlogPostCommandSql)
export class UpdateBlogPostUseCaseSql
  implements ICommandHandler<UpdateBlogPostCommandSql>
{
  constructor(private postsRepository: PostsRepositorySql) {}

  async execute({
    blogId,
    postId,
    dto,
  }: UpdateBlogPostCommandSql): Promise<void> {
    await this.postsRepository.findByIdAndBlogIdOrNotFoundFail(postId, blogId);

    await this.postsRepository.updateBlogPost(postId, blogId, dto);
  }
}
