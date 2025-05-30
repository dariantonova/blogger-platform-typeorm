import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  BLOGS_PATH,
  DEFAULT_PAGE_SIZE,
  buildBlogPostsPath,
  POSTS_PATH,
  QueryType,
  VALID_BASIC_AUTH_VALUE,
} from '../../helpers/helper';
import request, { Response } from 'supertest';
import { CreatePostInputDto } from '../../../src/features/blogger-platform/posts/api/input-dto/create-post.input-dto';
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

  async createPost(
    createDto: any,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(POSTS_PATH)
      .set('Authorization', auth)
      .send(createDto)
      .expect(expectedStatusCode);
  }

  async createPosts(inputData: CreatePostInputDto[]): Promise<PostViewDto[]> {
    const responses: Response[] = [];
    for (const createDto of inputData) {
      const response = await this.createPost(createDto, HttpStatus.CREATED);
      responses.push(response);
    }
    return responses.map((res) => res.body as PostViewDto);
  }

  generatePostsData(
    numberOfPosts: number,
    blogId: string,
  ): CreatePostInputDto[] {
    const postsData: CreatePostInputDto[] = [];
    for (let i = 1; i < numberOfPosts + 1; i++) {
      const postData: CreatePostInputDto = {
        title: 'post ' + i,
        shortDescription: 'short description ' + i,
        content: 'content ' + i,
        blogId,
      };
      postsData.push(postData);
    }
    return postsData;
  }

  async createPostsWithGeneratedData(
    numberOfPosts: number,
    blogId: string,
  ): Promise<PostViewDto[]> {
    const postsInputData: CreatePostInputDto[] = this.generatePostsData(
      numberOfPosts,
      blogId,
    );
    return this.createPosts(postsInputData);
  }

  async deletePost(
    id: string,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(POSTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }

  async getPost(id: string, expectedStatusCode: HttpStatus): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(POSTS_PATH + '/' + id)
      .expect(expectedStatusCode);
  }

  async updatePost(
    id: string,
    updateDto: any,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(POSTS_PATH + '/' + id)
      .set('Authorization', auth)
      .send(updateDto)
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
  ) {
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
