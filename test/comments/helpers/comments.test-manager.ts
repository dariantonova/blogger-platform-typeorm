import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  COMMENTS_PATH,
  DEFAULT_PAGE_SIZE,
  POSTS_PATH,
  QueryType,
} from '../../helpers/helper';
import request, { Response } from 'supertest';
import { CommentViewDto } from '../../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';
import { CreatePostCommentInputDto } from '../../../src/features/blogger-platform/posts/api/input-dto/create-post-comment.input-dto';

export const DEFAULT_COMMENTS_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export class CommentsTestManager {
  constructor(private app: INestApplication) {}

  async getComment(
    id: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(COMMENTS_PATH + '/' + id)
      .expect(expectedStatusCode);
  }

  async getPostComments(
    postId: string,
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(POSTS_PATH + '/' + postId + '/comments')
      .query(query)
      .expect(expectedStatusCode);
  }

  async createPostComment(
    postId: string,
    dto: any,
    auth: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(POSTS_PATH + '/' + postId + '/comments')
      .set('Authorization', auth)
      .send(dto)
      .expect(expectedStatusCode);
  }

  async createCommentsWithGeneratedData(
    numberOfComments: number,
    postId: string,
    auth: string,
  ): Promise<CommentViewDto[]> {
    const result: CommentViewDto[] = [];

    for (let i = 1; i <= numberOfComments; i++) {
      const inputDto: CreatePostCommentInputDto = {
        content: `comment ${i}`.repeat(10),
      };

      const createCommentResponse = await this.createPostComment(
        postId,
        inputDto,
        auth,
        HttpStatus.CREATED,
      );

      result.push(createCommentResponse.body);
    }

    return result;
  }

  async deleteComment(
    id: string,
    auth: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(COMMENTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }
}
