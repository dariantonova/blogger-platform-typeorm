import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryWrap } from '../../infrastructure/blogs.repository.wrap';

export class DeleteBlogCommandWrap {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommandWrap)
export class DeleteBlogUseCaseWrap
  implements ICommandHandler<DeleteBlogCommandWrap>
{
  constructor(private blogsRepository: BlogsRepositoryWrap) {}

  async execute({ blogId }: DeleteBlogCommandWrap): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);

    // await this.deleteBlogPosts(blogId);
  }

  // private async deleteBlogPosts(blogId: string): Promise<void> {
  //   const posts = await this.postsRepository.findAllBlogPosts(blogId);
  //
  //   for (const post of posts) {
  //     post.makeDeleted();
  //   }
  //
  //   const savePromises = posts.map((post) => this.postsRepository.save(post));
  //   await Promise.all(savePromises);
  // }
}
