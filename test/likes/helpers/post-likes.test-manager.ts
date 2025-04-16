import { HttpStatus, INestApplication } from '@nestjs/common';
import { LikeModelType } from '../../../src/features/blogger-platform/likes/domain/like.entity';
import { LikeStatus } from '../../../src/features/blogger-platform/likes/dto/like-status';
import request, { Response } from 'supertest';
import { POSTS_PATH } from '../../helpers/helper';

export class PostLikesTestManager {
  constructor(
    private app: INestApplication,
    private LikeModel: LikeModelType,
  ) {}

  async checkPostLikesCount(
    postId: string,
    expectedCount: number,
  ): Promise<void> {
    const count = await this.LikeModel.countDocuments({
      status: LikeStatus.Like,
      postId,
      deletedAt: null,
    });
    expect(count).toBe(expectedCount);
  }

  async updatePostLikeStatus(
    postId: string,
    dto: any,
    auth: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(POSTS_PATH + '/' + postId + '/like-status')
      .set('Authorization', auth)
      .send(dto)
      .expect(expectedStatusCode);
  }
}
