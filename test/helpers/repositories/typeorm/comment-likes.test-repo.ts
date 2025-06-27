import { DataSource, In } from 'typeorm';
import { CommentLike } from '../../../../src/features/typeorm/entities/blogger-platform/comment-like.entity';
import { LikeStatus } from '../../../../src/features/blogger-platform/likes/dto/like-status';

export class CommentLikesTestRepo {
  constructor(private dataSource: DataSource) {}

  async checkCommentLikesWithLikeStatusCount(
    commentId: string,
    expectedCount: number,
  ): Promise<void> {
    const count = await this.dataSource
      .getRepository(CommentLike)
      .count({ where: { commentId: +commentId, status: LikeStatus.Like } });

    expect(count).toBe(expectedCount);
  }

  async checkCommentLikesCount(
    commentId: string,
    expectedCount: number,
  ): Promise<void> {
    const count = await this.dataSource
      .getRepository(CommentLike)
      .count({ where: { commentId: +commentId } });

    expect(count).toBe(expectedCount);
  }

  async assertCommentsHaveNoLikes(commentIds: string[]): Promise<void> {
    const commentIdNumbers = commentIds.map((c) => +c);
    const count = await this.dataSource
      .getRepository(CommentLike)
      .count({ where: { commentId: In(commentIdNumbers) } });

    expect(count).toBe(0);
  }
}
