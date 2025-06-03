import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../../blogger-platform/likes/dto/like-status';

@Injectable()
export class CommentLikesQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findCommentLikeStatus(
    commentId: number,
    userId: number,
  ): Promise<LikeStatus> {
    const findQuery = `
    SELECT
    cl.status
    FROM comment_likes cl
    WHERE cl.comment_id = $1
    AND cl.user_id = $2
    AND cl.deleted_at IS NULL;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      commentId,
      userId,
    ]);

    return findResult[0] ? findResult[0].status : LikeStatus.None;
  }
}
