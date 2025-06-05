import { DataSource } from 'typeorm';

export class CommentLikesTestRepositorySql {
  constructor(private dataSource: DataSource) {}

  async checkCommentLikesWithLikeStatusCount(
    commentId: string,
    expectedCount: number,
  ): Promise<void> {
    const countQuery = `
    SELECT
    COUNT(*)::int as likes_count
    FROM comment_likes cl
    WHERE cl.deleted_at IS NULL
    AND cl.status = 'Like'
    AND cl.comment_id = $1;
    `;
    const countResult = await this.dataSource.query(countQuery, [commentId]);

    expect(countResult[0]).toBeDefined();
    expect(countResult[0].likes_count).toBe(expectedCount);
  }

  async assertCommentsHaveNoLikes(commentIds: string[]): Promise<void> {
    const findQuery = `
    SELECT cl.id
    FROM comment_likes cl
    WHERE cl.comment_id = ANY($1)
    AND cl.deleted_at IS NULL;
    `;
    const findResult = await this.dataSource.query(findQuery, [commentIds]);

    expect(findResult.length).toBe(0);
  }

  async checkCommentLikesCount(
    commentId: string,
    expectedCount: number,
  ): Promise<void> {
    const countQuery = `
    SELECT
    COUNT(*)::int as likes_count
    FROM comment_likes cl
    WHERE cl.deleted_at IS NULL
    AND cl.comment_id = $1;
    `;
    const countResult = await this.dataSource.query(countQuery, [commentId]);

    expect(countResult[0]).toBeDefined();
    expect(countResult[0].likes_count).toBe(expectedCount);
  }
}
