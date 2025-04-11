import { UpdateBlogDto } from '../../../dto/update-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ blogId, dto }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    blog.update(dto);

    await this.blogsRepository.save(blog);

    await this.updateBlogPostsBlogNames(blog._id.toString(), blog.name);
  }

  private async updateBlogPostsBlogNames(
    blogId: string,
    blogName: string,
  ): Promise<void> {
    const posts = await this.postsRepository.findAllBlogPosts(blogId);

    for (const post of posts) {
      post.updateBlogName(blogName);
    }

    const savePromises = posts.map((post) => this.postsRepository.save(post));
    await Promise.all(savePromises);
  }
}
