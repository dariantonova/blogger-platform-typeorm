import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { POSTS_PATH } from '../../helpers/helper';
import { LikeStatus } from '../../../src/features/blogger-platform/likes/dto/like-status';

export class PostLikesTestManager {
  constructor(private app: INestApplication) {}

  // async checkPostLikesCount(
  //   postId: string,
  //   expectedCount: number,
  // ): Promise<void> {
  //   const count = await this.LikeModel.countDocuments({
  //     status: LikeStatus.Like,
  //     parentId: postId,
  //     deletedAt: null,
  //   });
  //   expect(count).toBe(expectedCount);
  // }

  async makePostLikeOperation(
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

  async makePostLikeOperationSuccess(
    postId: string,
    likeStatus: LikeStatus,
    auth: string,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(POSTS_PATH + '/' + postId + '/like-status')
      .set('Authorization', auth)
      .send({ likeStatus })
      .expect(HttpStatus.NO_CONTENT);
  }

  async addLikesWithAllStatusesToPost(
    postId: string,
    usersAuthStrings: string[],
  ): Promise<void> {
    await this.makePostLikeOperationSuccess(
      postId,
      LikeStatus.Like,
      usersAuthStrings[0],
    );
    await this.makePostLikeOperationSuccess(
      postId,
      LikeStatus.Dislike,
      usersAuthStrings[1],
    );
    await this.makePostLikeOperationSuccess(
      postId,
      LikeStatus.None,
      usersAuthStrings[2],
    );
  }
}
