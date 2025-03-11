import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { Injectable } from '@nestjs/common';
import { PostsService } from '../../posts/application/posts.service';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
    private postsService: PostsService,
  ) {}

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.blogsRepository.findBlogByIdOrNotFoundFail(id);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);

    await this.postsService.deleteBlogPosts(blog._id.toString());
  }

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModel.createInstance(dto);

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsRepository.findBlogByIdOrNotFoundFail(id);

    blog.update(dto);

    await this.blogsRepository.save(blog);

    await this.postsService.updateBlogPostsBlogNames(
      blog._id.toString(),
      blog.name,
    );
  }
}
