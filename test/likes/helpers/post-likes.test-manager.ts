import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { POSTS_PATH } from '../../helpers/helper';
import { LikeStatus } from '../../../src/features/blogger-platform/likes/dto/like-status';
import { LikeDetailsViewDto } from '../../../src/features/blogger-platform/common/dto/like-details.view-dto';

export class PostLikesTestManager {
  constructor(private app: INestApplication) {}

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

  assertNewestLikesAreSortedByDateDesc(newestLikes: LikeDetailsViewDto[]) {
    for (let i = 1; i < newestLikes.length; i++) {
      const prev = new Date(newestLikes[i - 1].addedAt).getTime();
      const curr = new Date(newestLikes[i].addedAt).getTime();
      expect(curr).toBeLessThan(prev);
    }
  }
}
