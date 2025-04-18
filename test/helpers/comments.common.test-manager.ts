import { HttpStatus, INestApplication } from '@nestjs/common';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';
import { CreatePostCommentInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/create-post-comment.input-dto';
import request, { Response } from 'supertest';
import { COMMENTS_PATH, POSTS_PATH } from './helper';

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

  async deleteComment(id: string, auth: string): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(COMMENTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(HttpStatus.NO_CONTENT);
  }

  async getComment(id: string, auth: string = ''): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(COMMENTS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(HttpStatus.OK);

    return response.body as CommentViewDto;
  }
}
