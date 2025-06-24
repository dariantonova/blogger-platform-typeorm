import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { buildWhereClause } from '../../../../../common/utils/sql/build-where-clause';
import { PostsSortBy } from '../../api/input-dto/posts-sort-by';
import { camelCaseToSnakeCase } from '../../../../../common/utils/camel-case-to-snake-case';
import { buildPaginationClause } from '../../../../../common/utils/sql/build-pagination-clause';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostViewRow } from './dto/post.view-row';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(
    id: number,
    currentUserId: number | undefined,
  ): Promise<PostViewRow | null> {
    const whereParts = ['p.deleted_at IS NULL', 'p.id = $1'];
    const whereClause = buildWhereClause(whereParts);

    const findSql = this.getPostsSelectSql(whereClause, '', '', currentUserId);
    const findResult = await this.dataSource.query(findSql, [id]);

    return findResult[0] ? findResult[0] : null;
  }

  async findByIdOrInternalFail(
    id: number,
    currentUserId: number | undefined,
  ): Promise<PostViewDto> {
    const post = await this.findById(id, currentUserId);

    if (!post) {
      throw new InternalServerErrorException('Post not found');
    }

    return PostViewDto.mapToView(post);
  }

  async findByIdOrNotFoundFail(
    id: number,
    currentUserId: number | undefined,
  ): Promise<PostViewDto> {
    const post = await this.findById(id, currentUserId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostViewDto.mapToView(post);
  }

  async checkPostExists(postId: number): Promise<boolean> {
    const findQuery = `
    SELECT
    p.id
    FROM posts p
    WHERE p.deleted_at IS NULL
    AND p.id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [postId]);

    return findResult.length > 0;
  }

  async checkPostExistsOrNotFoundFail(postId: number): Promise<void> {
    const isPostFound = await this.checkPostExists(postId);

    if (!isPostFound) {
      throw new NotFoundException('Post not found');
    }
  }

  async findPosts(
    queryParams: GetPostsQueryParams,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const whereParts = ['p.deleted_at IS NULL'];

    return this.findManyByWhereAndQuery(
      whereParts,
      [],
      queryParams,
      currentUserId,
    );
  }

  async findBlogPosts(
    blogId: number,
    queryParams: GetPostsQueryParams,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const whereParams: any[] = [blogId];
    const whereParts = ['p.deleted_at IS NULL', `p.blog_id = $1`];

    return this.findManyByWhereAndQuery(
      whereParts,
      whereParams,
      queryParams,
      currentUserId,
    );
  }

  private async findManyByWhereAndQuery(
    whereParts: string[],
    whereSqlParams: any[],
    queryParams: GetPostsQueryParams,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const sqlParams = [...whereSqlParams, limit, offset];

    const whereClause = buildWhereClause(whereParts);
    const orderClause = this.buildOrderClause(queryParams);
    const paginationClause = buildPaginationClause(sqlParams.length);

    const findSql = this.getPostsSelectSql(
      whereClause,
      orderClause,
      paginationClause,
      currentUserId,
    );
    const findResult = await this.dataSource.query<PostViewRow[]>(
      findSql,
      sqlParams,
    );

    const countSql = `
    SELECT
    COUNT(*)::int as count
    FROM posts p
    ${whereClause};
    `;
    const countResult = await this.dataSource.query(countSql, whereSqlParams);
    const totalCount = countResult[0].count;

    const posts = findResult.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView<PostViewDto[]>({
      items: posts,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  private getPostsSelectSql(
    whereClause: string,
    orderClause: string,
    paginationClause: string,
    currentUserId: number | undefined,
  ): string {
    const cteParts = [
      ...this.getPostLikesCteParts(currentUserId),
      this.getPaginatedPostsCtePart(whereClause, orderClause, paginationClause),
    ];
    const cte = `WITH ${cteParts.join(', ')}`;

    return `
    ${cte}
    SELECT
    p.id, p.title, p.short_description, p.content, p.created_at, 
    p.blog_id, p.blog_name,
    COALESCE(plc.likes_count, 0) as likes_count, 
    COALESCE(plc.dislikes_count, 0) as dislikes_count,
    COALESCE(pnl.newest_likes, '[]'::jsonb) as newest_likes,
    COALESCE(cupl.status, 'None') as my_status
    FROM paginated_posts p
    LEFT JOIN post_newest_likes pnl
    ON p.id = pnl.post_id
    LEFT JOIN post_likes_counts plc
    ON p.id = plc.post_id
    LEFT JOIN current_user_post_likes cupl
    ON p.id = cupl.post_id
    ${orderClause};
    `;
  }

  private getPostLikesCteParts(currentUserId: number | undefined): string[] {
    const newestPostLikesRankedCte = `
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

    const postNewestLikesCte = `
    SELECT
    n.post_id,
    JSONB_AGG(JSONB_BUILD_OBJECT('user_id', n.user_id, 'login', n.login, 'added_at', n.added_at) 
        order by n.rn asc) as newest_likes
    FROM newest_post_likes_ranked n
    WHERE n.rn <= 3
    GROUP BY n.post_id
    `;

    const postLikesCountsCte = `
    SELECT
    pl.post_id,
    COUNT(*) FILTER(WHERE status = 'Like')::int as likes_count, 
    COUNT(*) FILTER(WHERE status = 'Dislike')::int as dislikes_count
    FROM post_likes pl
    GROUP BY pl.post_id
    `;

    const currentUserPostLikesCte = `
    SELECT
    pl.post_id,
    pl.status
    FROM post_likes pl
    WHERE pl.user_id = ${currentUserId ?? -1}
    `;

    return [
      `newest_post_likes_ranked AS (${newestPostLikesRankedCte})`,
      `post_newest_likes AS (${postNewestLikesCte})`,
      `post_likes_counts AS (${postLikesCountsCte})`,
      `current_user_post_likes AS (${currentUserPostLikesCte})`,
    ];
  }

  private getPaginatedPostsCtePart(
    whereClause: string,
    orderClause: string,
    paginationClause: string,
  ): string {
    const paginatedPostsCte = `
    SELECT
    p.id, p.title, p.short_description, p.content, p.created_at,
    p.blog_id, b.name as blog_name
    FROM posts p
    LEFT JOIN blogs b
    ON p.blog_id = b.id
    ${whereClause}
    ${orderClause}
    ${paginationClause}
    `;

    return `paginated_posts AS (${paginatedPostsCte})`;
  }

  private buildOrderClause(queryParams: GetPostsQueryParams): string {
    const allowedSortFields = Object.values(PostsSortBy); // Защита от SQL-инъекций
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : PostsSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return `ORDER BY ${sortBy} ${sortDirection}`;
  }
}
