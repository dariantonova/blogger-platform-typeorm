import { HttpStatus, INestApplication } from '@nestjs/common';
import { COMMENTS_PATH, POSTS_PATH, QueryType } from '../../helpers/helper';
import request, { Response } from 'supertest';

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
}
