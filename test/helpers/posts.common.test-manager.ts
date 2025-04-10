import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { POSTS_PATH, VALID_BASIC_AUTH_VALUE } from './helper';
import { CreatePostInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/create-post.input-dto';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';

export class PostsCommonTestManager {
  constructor(private app: INestApplication) {}

  async deletePost(postId: string): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(POSTS_PATH + '/' + postId)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .expect(HttpStatus.NO_CONTENT);
  }

  async createPost(createDto: CreatePostInputDto): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(POSTS_PATH)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    return response.body as PostViewDto;
  }

  generatePostData(blogId: string, postNumber: number = 1): CreatePostInputDto {
    return {
      title: 'post ' + postNumber,
      shortDescription: 'short description ' + postNumber,
      content: 'content ' + postNumber,
      blogId,
    };
  }

  async createPostWithGeneratedData(blogId: string): Promise<PostViewDto> {
    const postData = this.generatePostData(blogId);
    return this.createPost(postData);
  }
}
