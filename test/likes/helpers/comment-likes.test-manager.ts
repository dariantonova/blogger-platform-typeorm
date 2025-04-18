import { HttpStatus, INestApplication } from '@nestjs/common';
import { LikeModelType } from '../../../src/features/blogger-platform/likes/domain/like.entity';
import { LikeStatus } from '../../../src/features/blogger-platform/likes/dto/like-status';
import request, { Response } from 'supertest';
import { COMMENTS_PATH, POSTS_PATH } from '../../helpers/helper';

export class CommentLikesTestManager {
  constructor(
    private app: INestApplication,
    private LikeModel: LikeModelType,
  ) {}

  async checkCommentLikesCount(
    commentId: string,
    expectedCount: number,
  ): Promise<void> {
    const count = await this.LikeModel.countDocuments({
      status: LikeStatus.Like,
      parentId: commentId,
      deletedAt: null,
    });
    expect(count).toBe(expectedCount);
  }

  async makeCommentLikeOperation(
    commentId: string,
    dto: any,
    auth: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(COMMENTS_PATH + '/' + commentId + '/like-status')
      .set('Authorization', auth)
      .send(dto)
      .expect(expectedStatusCode);
  }
}
