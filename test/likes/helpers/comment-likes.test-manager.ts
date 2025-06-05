import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { COMMENTS_PATH } from '../../helpers/helper';
import { LikeStatus } from '../../../src/features/blogger-platform/likes/dto/like-status';

export class CommentLikesTestManager {
  constructor(private app: INestApplication) {}

  // async checkCommentLikesCount(
  //   commentId: string,
  //   expectedCount: number,
  // ): Promise<void> {
  //   const count = await this.LikeModel.countDocuments({
  //     status: LikeStatus.Like,
  //     parentId: commentId,
  //     deletedAt: null,
  //   });
  //   expect(count).toBe(expectedCount);
  // }

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

  async makeCommentLikeOperationSuccess(
    commentId: string,
    likeStatus: LikeStatus,
    auth: string,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(COMMENTS_PATH + '/' + commentId + '/like-status')
      .set('Authorization', auth)
      .send({ likeStatus })
      .expect(HttpStatus.NO_CONTENT);
  }

  async addLikesWithAllStatusesToComment(
    commentId: string,
    usersAuthStrings: string[],
  ): Promise<void> {
    await this.makeCommentLikeOperationSuccess(
      commentId,
      LikeStatus.Like,
      usersAuthStrings[0],
    );
    await this.makeCommentLikeOperationSuccess(
      commentId,
      LikeStatus.Dislike,
      usersAuthStrings[1],
    );
    await this.makeCommentLikeOperationSuccess(
      commentId,
      LikeStatus.None,
      usersAuthStrings[2],
    );
  }
}
