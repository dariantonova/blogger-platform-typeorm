import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from '../../../src/features/blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import request, { Response } from 'supertest';
import { GLOBAL_PREFIX } from '../../../src/setup/global-prefix.setup';
import { BlogViewDto } from '../../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { DEFAULT_PAGE_SIZE, QueryType } from '../../helpers/helper';
import { UpdateBlogInputDto } from '../../../src/features/blogger-platform/blogs/api/input-dto/update-blog.input-dto';

const BLOGS_PATH = `/${GLOBAL_PREFIX}/blogs`;

export const DEFAULT_BLOGS_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export class BlogsTestManager {
  constructor(private app: INestApplication) {}

  async createBlog(
    createDto: CreateBlogInputDto,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(BLOGS_PATH)
      .send(createDto)
      .expect(expectedStatusCode);
  }

  async createBlogs(inputData: CreateBlogInputDto[]): Promise<BlogViewDto[]> {
    const responses: Response[] = [];
    for (const createDto of inputData) {
      const response = await this.createBlog(createDto, HttpStatus.CREATED);
      responses.push(response);
    }
    return responses.map((res) => res.body as BlogViewDto);
  }

  generateBlogData(numberOfBlogs: number): CreateBlogInputDto[] {
    const blogsData: CreateBlogInputDto[] = [];
    for (let i = 1; i < numberOfBlogs + 1; i++) {
      const blogData: CreateBlogInputDto = {
        name: 'blog ' + i,
        description: 'superblog ' + i,
        websiteUrl: 'https://superblog.com/' + i,
      };
      blogsData.push(blogData);
    }
    return blogsData;
  }

  async createBlogsWithGeneratedData(
    numberOfBlogs: number,
  ): Promise<BlogViewDto[]> {
    const blogsInputData: CreateBlogInputDto[] =
      this.generateBlogData(numberOfBlogs);
    return this.createBlogs(blogsInputData);
  }

  async getBlogs(
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .get(BLOGS_PATH)
      .query(query)
      .expect(expectedStatusCode);
  }

  async deleteBlog(
    id: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .delete(BLOGS_PATH + '/' + id)
      .expect(expectedStatusCode);
  }

  async getBlog(id: string, expectedStatusCode: HttpStatus): Promise<Response> {
    return await request(this.app.getHttpServer())
      .get(BLOGS_PATH + '/' + id)
      .expect(expectedStatusCode);
  }

  async updateBlog(
    id: string,
    updateDto: UpdateBlogInputDto,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(BLOGS_PATH + '/' + id)
      .send(updateDto)
      .expect(expectedStatusCode);
  }
}
