import { DataSource } from 'typeorm';

export class PostLikesTestRepository {
  constructor(private dataSource: DataSource) {}

  async checkPostLikesWithLikeStatusCount(
    postId: string,
    expectedCount: number,
  ): Promise<void> {
    const countQuery = `
    SELECT
    COUNT(*)::int as likes_count
    FROM post_likes pl
    WHERE pl.deleted_at IS NULL
    AND pl.status = 'Like'
    AND pl.post_id = $1;
    `;
    const countResult = await this.dataSource.query(countQuery, [postId]);

    expect(countResult[0]).toBeDefined();
    expect(countResult[0].likes_count).toBe(expectedCount);
  }

  async assertPostsHaveNoLikes(postIds: string[]): Promise<void> {
    const findQuery = `
    SELECT pl.id
    FROM post_likes pl
    WHERE pl.post_id = ANY($1)
    AND pl.deleted_at IS NULL;
    `;
    const findResult = await this.dataSource.query(findQuery, [postIds]);

    expect(findResult.length).toBe(0);
  }

  async checkPostLikesCount(
    postId: string,
    expectedCount: number,
  ): Promise<void> {
    const countQuery = `
    SELECT
    COUNT(*)::int as likes_count
    FROM post_likes pl
    WHERE pl.deleted_at IS NULL
    AND pl.post_id = $1;
    `;
    const countResult = await this.dataSource.query(countQuery, [postId]);

    expect(countResult[0]).toBeDefined();
    expect(countResult[0].likes_count).toBe(expectedCount);
  }
}
