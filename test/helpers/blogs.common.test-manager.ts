import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import request, { Response } from 'supertest';
import { BLOGS_PATH, VALID_BASIC_AUTH_VALUE } from './helper';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';

export class BlogsCommonTestManager {
  constructor(private app: INestApplication) {}

  async createBlog(createDto: CreateBlogInputDto): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(BLOGS_PATH)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    return response.body as BlogViewDto;
  }

  generateBlogData(blogNumber: number = 1): CreateBlogInputDto {
    return {
      name: 'blog ' + blogNumber,
      description: 'superblog ' + blogNumber,
      websiteUrl: 'https://superblog.com/' + blogNumber,
    };
  }

  async createBlogWithGeneratedData(): Promise<BlogViewDto> {
    const blogData = this.generateBlogData();
    return this.createBlog(blogData);
  }

  async createBlogsWithGeneratedData(
    numberOfBlogs: number,
  ): Promise<BlogViewDto[]> {
    const blogsData: CreateBlogInputDto[] = [];
    for (let i = 1; i <= numberOfBlogs; i++) {
      blogsData.push(this.generateBlogData(i));
    }
    return this.createBlogs(blogsData);
  }

  async createBlogs(inputData: CreateBlogInputDto[]): Promise<BlogViewDto[]> {
    const blogs: BlogViewDto[] = [];
    for (const createDto of inputData) {
      const blog = await this.createBlog(createDto);
      blogs.push(blog);
    }
    return blogs;
  }

  async deleteBlog(id: string): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(BLOGS_PATH + '/' + id)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .expect(HttpStatus.NO_CONTENT);
  }
}
