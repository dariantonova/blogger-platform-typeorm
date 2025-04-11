import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ blogId }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);

    await this.deleteBlogPosts(blogId);
  }

  private async deleteBlogPosts(blogId: string): Promise<void> {
    const posts = await this.postsRepository.findAllBlogPosts(blogId);

    for (const post of posts) {
      post.makeDeleted();
    }

    const savePromises = posts.map((post) => this.postsRepository.save(post));
    await Promise.all(savePromises);
  }
}
