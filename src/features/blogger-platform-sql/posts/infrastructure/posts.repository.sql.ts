import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreatePostRepoDto } from './dto/create-post.repo-dto';
import { PostDtoSql } from '../dto/post.dto.sql';
import { buildWhereClause } from '../../../../utils/sql/build-where-clause';
import { mapPostRowsToDtos } from './mappers/post.mapper';
import { UpdateBlogPostRepoDto } from './dto/update-blog-post.repo-dto';

@Injectable()
export class PostsRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async softDeleteByBlogId(blogId: number): Promise<void> {
    const updateQuery = `
    UPDATE posts
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND blog_id = $1;
    `;
    await this.dataSource.query(updateQuery, [blogId]);
  }

  async createPost(dto: CreatePostRepoDto): Promise<number> {
    const createQuery = `
    INSERT INTO posts
    (title, short_description, content, blog_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
    ]);

    return createResult[0].id;
  }

  async findById(id: number): Promise<PostDtoSql | null> {
    const whereParts = ['p.deleted_at IS NULL', 'p.id = $1'];
    const whereClause = buildWhereClause(whereParts);

    const findSql = this.getPostsSelectSql(whereClause, '', '');
    const findResult = await this.dataSource.query(findSql, [id]);

    const posts: PostDtoSql[] = mapPostRowsToDtos(findResult);

    return posts[0] ? posts[0] : null;
  }

  async findByIdAndBlogId(
    id: number,
    blogId: number,
  ): Promise<PostDtoSql | null> {
    const whereParts = ['p.deleted_at IS NULL', 'p.id = $1', 'p.blog_id = $2'];
    const whereClause = buildWhereClause(whereParts);

    const findSql = this.getPostsSelectSql(whereClause, '', '');
    const findResult = await this.dataSource.query(findSql, [id, blogId]);

    const posts: PostDtoSql[] = mapPostRowsToDtos(findResult);

    return posts[0] ? posts[0] : null;
  }

  async findByIdAndBlogIdOrNotFoundFail(
    id: number,
    blogId: number,
  ): Promise<PostDtoSql> {
    const post = await this.findByIdAndBlogId(id, blogId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async updateBlogPost(
    postId: number,
    blogId: number,
    dto: UpdateBlogPostRepoDto,
  ): Promise<void> {
    const updateQuery = `
    UPDATE posts
    SET title = $1,
        short_description = $2,
        content = $3,
        updated_at = now()
    WHERE id = $4
    AND blog_id = $5;
    `;
    await this.dataSource.query(updateQuery, [
      dto.title,
      dto.shortDescription,
      dto.content,
      postId,
      blogId,
    ]);
  }

  getPostLikesCteParts(): string[] {
    const newestPostLikesRankedQuery = `
    SELECT
    pl.post_id,
    pl.user_id,
    pl.created_at AS added_at,
    u.login,
    ROW_NUMBER() OVER (PARTITION BY pl.post_id ORDER BY pl.created_at DESC) AS rn
    FROM post_likes pl
    LEFT JOIN users u ON pl.user_id = u.id
    WHERE pl.status = 'Like'
    `;

    const postNewestLikesQuery = `
    SELECT *
    FROM newest_post_likes_ranked
    WHERE rn <= 3
    ORDER BY rn ASC
    `;

    const postLikesCountsQuery = `
    SELECT
    pl.post_id,
    COUNT(*) FILTER(WHERE status = 'Like')::int as likes_count, 
    COUNT(*) FILTER(WHERE status = 'Dislike')::int as dislikes_count
    FROM post_likes pl
    GROUP BY pl.post_id
    `;

    return [
      `newest_post_likes_ranked AS (${newestPostLikesRankedQuery})`,
      `post_newest_likes AS (${postNewestLikesQuery})`,
      `post_likes_counts AS (${postLikesCountsQuery})`,
    ];
  }

  getPaginatedPostsCtePart(
    whereClause: string,
    orderClause: string,
    paginationClause: string,
  ): string {
    const paginatedPostsQuery = `
    SELECT
    p.id, p.title, p.short_description, p.content, p.created_at, p.updated_at,
    p.blog_id, b.name as blog_name
    FROM posts p
    LEFT JOIN blogs b
    ON p.blog_id = b.id
    ${whereClause}
    ${orderClause}
    ${paginationClause}
    `;

    return `paginated_posts AS (${paginatedPostsQuery})`;
  }

  getPostsSelectSql(
    whereClause: string,
    postsOrderClause: string,
    paginationClause: string,
  ): string {
    const cteParts = [
      ...this.getPostLikesCteParts(),
      this.getPaginatedPostsCtePart(
        whereClause,
        postsOrderClause,
        paginationClause,
      ),
    ];
    const cte = `WITH ${cteParts.join(', ')}`;
    const orderClause =
      (postsOrderClause.length > 0 ? postsOrderClause + ', ' : 'ORDER BY ') +
      'like_added_at DESC';

    return `
    ${cte}
    SELECT
    p.id, p.title, p.short_description, p.content, p.created_at, p.updated_at,
    p.blog_id, p.blog_name,
    COALESCE(plc.likes_count, 0) as likes_count, 
    COALESCE(plc.dislikes_count, 0) as dislikes_count,
    pnl.user_id as like_user_id, pnl.login as like_user_login, pnl.added_at as like_added_at
    FROM paginated_posts p
    LEFT JOIN post_newest_likes pnl
    ON p.id = pnl.post_id
    LEFT JOIN post_likes_counts plc
    ON p.id = plc.post_id
    ${orderClause};
    `;
  }
}
