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
import { UsersCommonTestManager } from '../../helpers/users.common.test-manager';
import { AuthTestManager } from '../../auth/helpers/auth.test-manager';

export const DEFAULT_COMMENTS_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export class CommentsTestManager {
  constructor(
    private app: INestApplication,
    private usersCommonTestManager: UsersCommonTestManager,
    private authTestManager: AuthTestManager,
  ) {}

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

  generateCommentData(
    postId: string,
    commentNumber: number = 1,
  ): CreatePostCommentInputDto {
    return {
      content: `comment ${commentNumber}`.repeat(10),
    };
  }

  async createCommentWithGeneratedData(
    postId: string,
    auth: string,
  ): Promise<CommentViewDto> {
    const inputData = this.generateCommentData(postId);
    const createCommentResponse = await this.createPostComment(
      postId,
      inputData,
      auth,
      HttpStatus.CREATED,
    );
    return createCommentResponse.body;
  }

  async createCommentsWithGeneratedData(
    numberOfComments: number,
    postId: string,
    auth: string,
  ): Promise<CommentViewDto[]> {
    const result: CommentViewDto[] = [];

    for (let i = 1; i <= numberOfComments; i++) {
      const inputDto = this.generateCommentData(postId, i);

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

  async getValidAuth(): Promise<string> {
    const userData = {
      login: 'user1',
      email: 'user1@example.com',
      password: 'qwerty',
    };
    await this.usersCommonTestManager.createUser(userData);
    const userAccessToken = await this.authTestManager.getNewAccessToken(
      userData.login,
      userData.password,
    );
    return 'Bearer ' + userAccessToken;
  }

  async updateComment(
    commentId: string,
    dto: any,
    auth: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .put(COMMENTS_PATH + '/' + commentId)
      .set('Authorization', auth)
      .send(dto)
      .expect(expectedStatusCode);
  }
}
