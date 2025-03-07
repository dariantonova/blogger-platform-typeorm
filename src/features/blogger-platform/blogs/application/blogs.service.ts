import { BlogsRepository } from '../infrastructure/blogs.repository';

export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.blogsRepository.findBlogByIdOrNotFoundFail(id);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);
  }
}
