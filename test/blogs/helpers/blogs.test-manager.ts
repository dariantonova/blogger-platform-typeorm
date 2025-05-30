import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from '../../../src/features/blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import request, { Response } from 'supertest';
import { BlogViewDto } from '../../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import {
  BLOGS_PATH,
  BLOGS_SA_PATH,
  DEFAULT_PAGE_SIZE,
  QueryType,
  VALID_BASIC_AUTH_VALUE,
} from '../../helpers/helper';

export const DEFAULT_BLOGS_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export class BlogsTestManager {
  constructor(private app: INestApplication) {}

  async createBlog(
    createDto: any,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(BLOGS_SA_PATH)
      .set('Authorization', auth)
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

  generateBlogsData(numberOfBlogs: number): CreateBlogInputDto[] {
    const blogsData: CreateBlogInputDto[] = [];
    for (let i = 1; i <= numberOfBlogs; i++) {
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
      this.generateBlogsData(numberOfBlogs);
    return this.createBlogs(blogsInputData);
  }

  async getBlogs(
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(BLOGS_PATH)
      .query(query)
      .expect(expectedStatusCode);
  }

  async getBlogsSa(
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(BLOGS_SA_PATH)
      .set('Authorization', auth)
      .query(query)
      .expect(expectedStatusCode);
  }

  async deleteBlog(
    id: string,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(BLOGS_SA_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }

  async getBlog(id: string, expectedStatusCode: HttpStatus): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(BLOGS_PATH + '/' + id)
      .expect(expectedStatusCode);
  }

  async updateBlog(
    id: string,
    updateDto: any,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(BLOGS_SA_PATH + '/' + id)
      .set('Authorization', auth)
      .send(updateDto)
      .expect(expectedStatusCode);
  }

  async checkBlogsCount(count: number): Promise<void> {
    const getBlogsResponse = await this.getBlogs(HttpStatus.OK);
    expect(getBlogsResponse.body.totalCount).toBe(count);
  }
}
