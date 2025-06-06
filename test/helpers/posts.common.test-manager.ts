import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import {
  buildBlogPostsPath,
  POSTS_PATH,
  QueryType,
  VALID_BASIC_AUTH_VALUE,
} from './helper';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { CreateBlogPostInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog-post.input-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';

export class PostsCommonTestManager {
  constructor(private app: INestApplication) {}

  // async deletePost(postId: string): Promise<Response> {
  //   return request(this.app.getHttpServer())
  //     .delete(POSTS_PATH + '/' + postId)
  //     .set('Authorization', VALID_BASIC_AUTH_VALUE)
  //     .expect(HttpStatus.NO_CONTENT);
  // }

  async deleteBlogPost(blogId: string, postId: string): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(buildBlogPostsPath(true, blogId, postId))
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .expect(HttpStatus.NO_CONTENT);
  }

  // async createPost(createDto: CreatePostInputDto): Promise<PostViewDto> {
  //   const response = await request(this.app.getHttpServer())
  //     .post(POSTS_PATH)
  //     .set('Authorization', VALID_BASIC_AUTH_VALUE)
  //     .send(createDto)
  //     .expect(HttpStatus.CREATED);
  //
  //   return response.body as PostViewDto;
  // }

  async createBlogPost(
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

  // generatePostData(blogId: string, postNumber: number = 1): CreatePostInputDto {
  //   return {
  //     title: 'post ' + postNumber,
  //     shortDescription: 'short description ' + postNumber,
  //     content: 'content ' + postNumber,
  //     blogId,
  //   };
  // }

  generateBlogPostData(postNumber: number = 1): CreateBlogPostInputDto {
    return {
      title: 'post ' + postNumber,
      shortDescription: 'short description ' + postNumber,
      content: 'content ' + postNumber,
    };
  }

  // async createPostWithGeneratedData(blogId: string): Promise<PostViewDto> {
  //   const postData = this.generatePostData(blogId);
  //   return this.createPost(postData);
  // }

  async createBlogPostWithGeneratedData(blogId: string): Promise<PostViewDto> {
    const postData = this.generateBlogPostData();
    return this.createBlogPost(blogId, postData);
  }

  // async createPostsWithGeneratedData(
  //   numberOfPosts: number,
  //   blogId: string,
  // ): Promise<PostViewDto[]> {
  //   const result: PostViewDto[] = [];
  //
  //   for (let i = 1; i <= numberOfPosts; i++) {
  //     const inputDto = this.generatePostData(blogId, i);
  //     const createdPost = await this.createPost(inputDto);
  //     result.push(createdPost);
  //   }
  //
  //   return result;
  // }

  async createBlogPostsWithGeneratedData(
    numberOfPosts: number,
    blogId: string,
  ): Promise<PostViewDto[]> {
    const result: PostViewDto[] = [];

    for (let i = 1; i <= numberOfPosts; i++) {
      const inputDto = this.generateBlogPostData(i);
      const createdPost = await this.createBlogPost(blogId, inputDto);
      result.push(createdPost);
    }

    return result;
  }

  async getPost(
    id: string,
    expectedStatusCode: number,
    auth: string = '',
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(POSTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }

  async getPostSuccess(id: string, auth: string = ''): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(POSTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(HttpStatus.OK);
    return response.body as PostViewDto;
  }

  async assertPostsAreDeleted(postIds: string[]): Promise<void> {
    const promises: any[] = [];
    for (const postId of postIds) {
      const getPostPromise = this.getPost(postId, HttpStatus.NOT_FOUND);
      promises.push(getPostPromise);
    }
    await Promise.all(promises);
  }

  async getPosts(
    query: QueryType = {},
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get(POSTS_PATH)
      .query(query)
      .expect(HttpStatus.OK);

    return response.body;
  }

  async getBlogPosts(
    blogId: string,
    query: QueryType = {},
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get(buildBlogPostsPath(false, blogId))
      .query(query)
      .expect(HttpStatus.OK);

    return response.body;
  }
}
