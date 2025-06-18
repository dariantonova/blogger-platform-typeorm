import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  buildBlogPostsPath,
  DEFAULT_PAGE_SIZE,
  POSTS_PATH,
  QueryType,
  VALID_BASIC_AUTH_VALUE,
} from '../../helpers/helper';
import request, { Response } from 'supertest';
import { PostViewDto } from '../../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { CreateBlogPostInputDto } from '../../../src/features/blogger-platform/blogs/api/input-dto/create-blog-post.input-dto';

export const DEFAULT_POSTS_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export class PostsTestManager {
  constructor(private app: INestApplication) {}

  async getPosts(
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(POSTS_PATH)
      .query(query)
      .expect(expectedStatusCode);
  }

  async getPost(id: string, expectedStatusCode: HttpStatus): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(POSTS_PATH + '/' + id)
      .expect(expectedStatusCode);
  }

  async createBlogPost(
    blogId: string,
    createDto: any,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(buildBlogPostsPath(true, blogId))
      .set('Authorization', auth)
      .send(createDto)
      .expect(expectedStatusCode);
  }

  async createBlogPostSuccess(
    blogId: string,
    createDto: CreateBlogPostInputDto,
  ): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(buildBlogPostsPath(true, blogId))
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    return response.body as PostViewDto;
  }

  async createBlogPosts(
    blogId: string,
    inputData: CreateBlogPostInputDto[],
  ): Promise<PostViewDto[]> {
    const responses: Response[] = [];
    for (const createDto of inputData) {
      const response = await this.createBlogPost(
        blogId,
        createDto,
        HttpStatus.CREATED,
      );
      responses.push(response);
    }
    return responses.map((res) => res.body as PostViewDto);
  }

  generateBlogPostData(postNumber: number = 1): CreateBlogPostInputDto {
    return {
      title: 'post ' + postNumber,
      shortDescription: 'short description ' + postNumber,
      content: 'content ' + postNumber,
    };
  }

  generateBlogPostsData(numberOfPosts: number): CreateBlogPostInputDto[] {
    const postsData: CreateBlogPostInputDto[] = [];
    for (let i = 1; i < numberOfPosts + 1; i++) {
      const postData: CreateBlogPostInputDto = {
        title: 'post ' + i,
        shortDescription: 'short description ' + i,
        content: 'content ' + i,
      };
      postsData.push(postData);
    }
    return postsData;
  }

  async createBlogPostWithGeneratedData(blogId: string): Promise<PostViewDto> {
    const postData = this.generateBlogPostData();
    return this.createBlogPostSuccess(blogId, postData);
  }

  async createBlogPostsWithGeneratedData(
    numberOfPosts: number,
    blogId: string,
  ): Promise<PostViewDto[]> {
    const postsInputData: CreateBlogPostInputDto[] =
      this.generateBlogPostsData(numberOfPosts);
    return this.createBlogPosts(blogId, postsInputData);
  }

  async deleteBlogPost(
    blogId: string,
    postId: string,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(buildBlogPostsPath(true, blogId, postId))
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }

  async deleteBlogPostSuccess(
    blogId: string,
    postId: string,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(buildBlogPostsPath(true, blogId, postId))
      .set('Authorization', auth)
      .expect(HttpStatus.NO_CONTENT);
  }

  async updateBlogPost(
    blogId: string,
    postId: string,
    updateDto: any,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(buildBlogPostsPath(true, blogId, postId))
      .set('Authorization', auth)
      .send(updateDto)
      .expect(expectedStatusCode);
  }

  async getBlogPosts(
    blogId: string,
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(buildBlogPostsPath(false, blogId))
      .query(query)
      .expect(expectedStatusCode);
  }

  async checkPostsCount(count: number): Promise<void> {
    const getPostsResponse = await this.getPosts(HttpStatus.OK);
    expect(getPostsResponse.body.totalCount).toBe(count);
  }

  async checkBlogPostsCount(blogId: string, count: number): Promise<void> {
    const getBlogPostsResponse = await this.getBlogPosts(blogId, HttpStatus.OK);
    expect(getBlogPostsResponse.body.totalCount).toBe(count);
  }
}
