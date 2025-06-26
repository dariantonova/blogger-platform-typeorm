import { HttpStatus, INestApplication } from '@nestjs/common';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';
import { CreatePostCommentInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/create-post-comment.input-dto';
import request, { Response } from 'supertest';
import { COMMENTS_PATH, POSTS_PATH, QueryType } from './helper';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';

export class CommentsCommonTestManager {
  constructor(private app: INestApplication) {}

  async createPostComment(
    postId: string,
    dto: CreatePostCommentInputDto,
    auth: string,
  ): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(POSTS_PATH + '/' + postId + '/comments')
      .set('Authorization', auth)
      .send(dto)
      .expect(HttpStatus.CREATED);

    return response.body as CommentViewDto;
  }

  private generateCommentData(
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
    const inputData = this.generateCommentData();
    return this.createPostComment(postId, inputData, auth);
  }

  async createCommentsWithGeneratedData(
    numberOfComments: number,
    postId: string,
    auth: string,
  ): Promise<CommentViewDto[]> {
    const createdComments: CommentViewDto[] = [];
    for (let i = 1; i <= numberOfComments; i++) {
      const inputData = this.generateCommentData();
      const createdComment = await this.createPostComment(
        postId,
        inputData,
        auth,
      );
      createdComments.push(createdComment);
    }
    return createdComments;
  }

  async deleteComment(id: string, auth: string): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(COMMENTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(HttpStatus.NO_CONTENT);
  }

  async getComment(
    id: string,
    expectedStatusCode: number,
    auth: string = '',
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(COMMENTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }

  async getCommentSuccess(
    id: string,
    auth: string = '',
  ): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(COMMENTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(HttpStatus.OK);

    return response.body as CommentViewDto;
  }

  async assertCommentsAreDeleted(commentIds: string[]): Promise<void> {
    const promises: any[] = [];
    for (const commentId of commentIds) {
      const getCommentPromise = this.getComment(
        commentId,
        HttpStatus.NOT_FOUND,
      );
      promises.push(getCommentPromise);
    }
    await Promise.all(promises);
  }

  async getPostCommentsSuccess(
    postId: string,
    query: QueryType = {},
    auth: string = '',
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get(POSTS_PATH + '/' + postId + '/comments')
      .set('Authorization', auth)
      .query(query)
      .expect(HttpStatus.OK);

    return response.body;
  }
}
