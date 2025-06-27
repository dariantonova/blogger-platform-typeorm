import { DataSource, In } from 'typeorm';
import { LikeStatus } from '../../../src/features/blogger-platform/likes/dto/like-status';
import { PostLike } from '../../../src/features/blogger-platform/likes/domain/post-like.entity';

export class PostLikesTestRepo {
  constructor(private dataSource: DataSource) {}

  async checkPostLikesWithLikeStatusCount(
    postId: string,
    expectedCount: number,
  ): Promise<void> {
    const count = await this.dataSource
      .getRepository(PostLike)
      .count({ where: { postId: +postId, status: LikeStatus.Like } });

    expect(count).toBe(expectedCount);
  }

  async checkPostLikesCount(
    postId: string,
    expectedCount: number,
  ): Promise<void> {
    const count = await this.dataSource
      .getRepository(PostLike)
      .count({ where: { postId: +postId } });

    expect(count).toBe(expectedCount);
  }

  async assertPostsHaveNoLikes(postIds: string[]): Promise<void> {
    const postIdNumbers = postIds.map((c) => +c);
    const count = await this.dataSource
      .getRepository(PostLike)
      .count({ where: { postId: In(postIdNumbers) } });

    expect(count).toBe(0);
  }
}
