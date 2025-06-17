import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryWrap } from '../../infrastructure/posts.repository.wrap';
import { UpdateBlogPostDtoWrap } from '../../dto/update-blog-post.dto.wrap';

export class UpdateBlogPostCommandWrap {
  constructor(
    public blogId: number,
    public postId: number,
    public dto: UpdateBlogPostDtoWrap,
  ) {}
}

@CommandHandler(UpdateBlogPostCommandWrap)
export class UpdateBlogPostUseCaseWrap
  implements ICommandHandler<UpdateBlogPostCommandWrap>
{
  constructor(private postsRepository: PostsRepositoryWrap) {}

  async execute({
    blogId,
    postId,
    dto,
  }: UpdateBlogPostCommandWrap): Promise<void> {
    const post = await this.postsRepository.findByIdAndBlogIdOrNotFoundFail(
      postId,
      blogId,
    );

    post.update({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
    });

    await this.postsRepository.save(post);
  }
}
