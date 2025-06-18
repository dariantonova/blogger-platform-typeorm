import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UpdateBlogPostDto } from '../../dto/update-blog-post.dto';

export class UpdateBlogPostCommandWrap {
  constructor(
    public blogId: number,
    public postId: number,
    public dto: UpdateBlogPostDto,
  ) {}
}

@CommandHandler(UpdateBlogPostCommandWrap)
export class UpdateBlogPostUseCaseWrap
  implements ICommandHandler<UpdateBlogPostCommandWrap>
{
  constructor(private postsRepository: PostsRepository) {}

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
