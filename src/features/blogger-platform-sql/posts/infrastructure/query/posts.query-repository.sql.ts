import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetPostsQueryParams } from '../../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostDtoSql } from '../../dto/post.dto.sql';
import { camelCaseToSnakeCase } from '../../../../../utils/camel-case-to-snake-case';
import { PostsSortBy } from '../../../../blogger-platform/posts/api/input-dto/posts-sort-by';
import { mapPostRowsToDtos } from '../mappers/post.mapper';

@Injectable()
export class PostsQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogPosts(
    blogId: number,
    queryParams: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostDtoSql[]>> {
    const params: any[] = [blogId];
    const whereParts = [
      'p.deleted_at IS NULL',
      `p.blog_id = $${params.length}`,
    ];

    const whereClause =
      whereParts.length > 0 ? 'WHERE ' + whereParts.join(' AND ') : '';

    const searchParams = [...params];

    const allowedSortFields = Object.values(PostsSortBy); // Защита от SQL-инъекций
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : PostsSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    params.push(limit);
    params.push(offset);

    const newestPostLikesRanked = `
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
    `;

    const postLikesCountsQuery = `
    SELECT
    pl.post_id,
    COUNT(*) FILTER(WHERE status = 'Like')::int as likes_count, 
    COUNT(*) FILTER(WHERE status = 'Dislike')::int as dislikes_count
    FROM post_likes pl
    GROUP BY pl.post_id
    `;

    const findSql = `
    WITH newest_post_likes_ranked AS (${newestPostLikesRanked}),
    post_newest_likes AS (${postNewestLikesQuery}),
    post_likes_counts AS (${postLikesCountsQuery})
    SELECT
    p.id, p.title, p.short_description, p.content, p.created_at, p.updated_at,
    p.blog_id, b.name as blog_name,
    COALESCE(plc.likes_count, 0) as likes_count, 
    COALESCE(plc.dislikes_count, 0) as dislikes_count,
    pnl.user_id as like_user_id, pnl.login as like_user_login, pnl.added_at as like_added_at
    FROM posts p
    LEFT JOIN blogs b
    ON p.blog_id = b.id
    LEFT JOIN post_newest_likes pnl
    ON p.id = pnl.post_id
    LEFT JOIN post_likes_counts plc
    ON p.id = plc.post_id
    ${whereClause}
    ORDER BY ${sortBy} ${sortDirection}
    LIMIT $${params.length - 1} OFFSET $${params.length};
    `;
    const findResult = await this.dataSource.query(findSql, params);

    const countSql = `
    SELECT
    COUNT(*)::int as count
    FROM posts p
    ${whereClause};
    `;
    const countResult = await this.dataSource.query(countSql, searchParams);
    const totalCount = countResult[0].count;

    const posts: PostDtoSql[] = mapPostRowsToDtos(findResult);

    return PaginatedViewDto.mapToView<PostDtoSql[]>({
      items: posts,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }
}
