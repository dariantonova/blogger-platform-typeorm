import { HttpStatus, INestApplication } from '@nestjs/common';
import { COMMENTS_PATH } from '../../helpers/helper';
import request, { Response } from 'supertest';

export class CommentsTestManager {
  constructor(private app: INestApplication) {}

  async getComment(
    id: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .get(COMMENTS_PATH + '/' + id)
      .expect(expectedStatusCode);
  }
}
