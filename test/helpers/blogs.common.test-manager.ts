import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import request from 'supertest';
import { BLOGS_PATH } from './helper';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';

export class BlogsCommonTestManager {
  constructor(private app: INestApplication) {}

  async createBlog(createDto: CreateBlogInputDto): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(BLOGS_PATH)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    return response.body as BlogViewDto;
  }

  generateBlogData(): CreateBlogInputDto {
    return {
      name: 'blog',
      description: 'superblog',
      websiteUrl: 'https://superblog.com/',
    };
  }

  async createBlogWithGeneratedData(): Promise<BlogViewDto> {
    const blogData = this.generateBlogData();
    return this.createBlog(blogData);
  }

  async createBlogs(inputData: CreateBlogInputDto[]): Promise<BlogViewDto[]> {
    const blogs: BlogViewDto[] = [];
    for (const createDto of inputData) {
      const blog = await this.createBlog(createDto);
      blogs.push(blog);
    }
    return blogs;
  }
}
