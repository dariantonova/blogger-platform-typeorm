import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../../blogger-platform/likes/dto/like-status';

@Injectable()
export class PostLikesQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPostLikeStatus(
    postId: number,
    userId: number,
  ): Promise<LikeStatus> {
    const findQuery = `
    SELECT
    pl.status
    FROM post_likes pl
    WHERE pl.post_id = $1
    AND pl.user_id = $2
    AND pl.deleted_at IS NULL;
    `;
    const findResult = await this.dataSource.query(findQuery, [postId, userId]);

    return findResult[0] ? findResult[0].status : LikeStatus.None;
  }
}
