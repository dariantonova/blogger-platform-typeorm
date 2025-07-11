import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostLike } from '../../../likes/domain/post-like.entity';
import { Post } from '../../domain/post.entity';
import { PostsSortBy } from '../../api/input-dto/posts-sort-by';
import { PostViewRow } from './dto/post.view-row';
import { WherePart } from '../../../../../common/types/typeorm/where-part';
import { CtePart } from '../../../../../common/types/typeorm/cte-part';
import { SortDirectionSql } from '../../../../../common/types/typeorm/sort-direction-sql';
import { addWherePartsToQueryBuilder } from '../../../../../common/utils/typeorm/add-where-parts-to-query-builder.util';
import { camelCaseToSnakeCase } from '../../../../../common/utils/camel-case-to-snake-case.util';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code';

@Injectable()
export class PostsQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPosts(
    queryParams: GetPostsQueryParams,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.findManyByWhereAndQuery([], queryParams, currentUserId);
  }

  async findBlogPosts(
    blogId: number,
    queryParams: GetPostsQueryParams,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const whereParts: WherePart[] = [
      { expression: 'p.blog_id = :blogId', params: { blogId } },
    ];

    return this.findManyByWhereAndQuery(whereParts, queryParams, currentUserId);
  }

  async findByIdOrInternalFail(
    id: number,
    currentUserId: number | undefined,
  ): Promise<PostViewDto> {
    const post = await this.findById(id, currentUserId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Post not found',
      });
    }

    return PostViewDto.mapToView(post);
  }

  async findByIdOrNotFoundFail(
    id: number,
    currentUserId: number | undefined,
  ): Promise<PostViewDto> {
    const post = await this.findById(id, currentUserId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return PostViewDto.mapToView(post);
  }

  async checkPostExists(postId: number): Promise<boolean> {
    return this.dataSource
      .createQueryBuilder()
      .from(Post, 'p')
      .where('p.id = :id', { id: postId })
      .getExists();
  }

  async checkPostExistsOrNotFoundFail(postId: number): Promise<void> {
    const postExists = await this.checkPostExists(postId);

    if (!postExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
  }

  private async findById(
    id: number,
    currentUserId: number | undefined,
  ): Promise<PostViewRow | null> {
    const whereParts: WherePart[] = [
      { expression: 'p.id = :id', params: { id } },
    ];

    const queryBuilder = this.getPostsSelectQB(currentUserId, whereParts);
    const post = await queryBuilder.getRawOne<PostViewRow>();

    return post ? post : null;
  }

  private async findManyByWhereAndQuery(
    whereParts: WherePart[],
    queryParams: GetPostsQueryParams,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const [sortBy, sortDirection] = this.validateSortQueryParams(queryParams);
    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const queryBuilder = this.getPostsSelectQB(
      currentUserId,
      whereParts,
      sortBy,
      sortDirection,
      limit,
      offset,
    );

    const postRows = await queryBuilder.getRawMany<PostViewRow>();
    const items = postRows.map(PostViewDto.mapToView);

    const countQB = this.dataSource.createQueryBuilder().from(Post, 'p');
    addWherePartsToQueryBuilder(countQB, whereParts);
    const totalCount = await countQB.getCount();

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  private getPostsSelectQB(
    currentUserId: number | undefined,
    whereParts: WherePart[] = [],
    sortBy?: string,
    sortDirection?: SortDirectionSql,
    limit?: number,
    offset?: number,
  ): SelectQueryBuilder<any> {
    const queryBuilder = this.dataSource.createQueryBuilder();

    const cteParts = [
      ...this.buildPostLikesCteParts(currentUserId),
      this.buildPaginatedPostsCtePart(
        whereParts,
        sortBy,
        sortDirection,
        limit,
        offset,
      ),
    ];

    for (const ctePart of cteParts) {
      queryBuilder.addCommonTableExpression(ctePart.qb, ctePart.alias);
    }

    queryBuilder
      .select([
        'p.id as id',
        'p.title as title',
        'p.short_description as short_description',
        'p.content as content',
        'p.created_at as created_at',
        'p.blog_id as blog_id',
        'p.blog_name as blog_name',
        'COALESCE(plc.likes_count, 0) as likes_count',
        'COALESCE(plc.dislikes_count, 0) as dislikes_count',
        `COALESCE(l3pl.newest_likes, '[]'::jsonb) as newest_likes`,
        `COALESCE(cupl.status, 'None') as my_status`,
      ])
      .from('paginated_posts', 'p')
      .leftJoin('last_3_post_likes', 'l3pl', 'p.id = l3pl.post_id')
      .leftJoin('post_likes_counts', 'plc', 'p.id = plc.post_id')
      .leftJoin('current_user_post_likes', 'cupl', 'p.id = cupl.post_id');

    if (sortBy) {
      queryBuilder.orderBy(sortBy, sortDirection);
    }

    return queryBuilder;
  }

  private buildPostLikesCteParts(currentUserId: number | undefined): CtePart[] {
    const newestPostLikesRankedCteQB = this.dataSource
      .createQueryBuilder()
      .select([
        'pl.post_id as post_id',
        'pl.user_id as user_id',
        'pl.created_at as added_at',
        'u.login as login',
        'ROW_NUMBER() OVER (PARTITION BY pl.post_id ORDER BY pl.created_at DESC) as rn',
      ])
      .from(PostLike, 'pl')
      .leftJoin('pl.user', 'u')
      .where("pl.status = 'Like'");

    const last3PostLikesCteQB = this.dataSource
      .createQueryBuilder()
      .select([
        'n.post_id as post_id',
        `JSONB_AGG(JSONB_BUILD_OBJECT('user_id', n.user_id, 'login', n.login, 'added_at', n.added_at)
        order by n.rn asc) as newest_likes`,
      ])
      .from('newest_post_likes_ranked', 'n')
      .where('n.rn <= 3')
      .groupBy('n.post_id');

    const postLikesCountsCteQB = this.dataSource
      .createQueryBuilder()
      .select([
        'pl.post_id as post_id',
        "COUNT(*) FILTER(WHERE status = 'Like')::int as likes_count",
        "COUNT(*) FILTER(WHERE status = 'Dislike')::int as dislikes_count",
      ])
      .from(PostLike, 'pl')
      .groupBy('pl.post_id');

    const currentUserPostLikesCteQB = this.dataSource
      .createQueryBuilder()
      .select(['pl.post_id as post_id', 'pl.status as status'])
      .from(PostLike, 'pl')
      .where('pl.user_id = :userId', { userId: currentUserId ?? -1 });

    return [
      { qb: newestPostLikesRankedCteQB, alias: 'newest_post_likes_ranked' },
      { qb: last3PostLikesCteQB, alias: 'last_3_post_likes' },
      { qb: postLikesCountsCteQB, alias: 'post_likes_counts' },
      { qb: currentUserPostLikesCteQB, alias: 'current_user_post_likes' },
    ];
  }

  private buildPaginatedPostsCtePart(
    whereParts: WherePart[],
    sortBy?: string,
    sortDirection?: SortDirectionSql,
    limit?: number,
    offset?: number,
  ): CtePart {
    const paginatedPostsCteQB = this.dataSource
      .createQueryBuilder()
      .select([
        'p.id as id',
        'p.title as title',
        'p.short_description as short_description',
        'p.content as content',
        'p.created_at as created_at',
        'p.blog_id as blog_id',
        'b.name as blog_name',
      ])
      .from(Post, 'p')
      .leftJoin('p.blog', 'b');

    if (sortBy) {
      paginatedPostsCteQB.orderBy(sortBy, sortDirection);
    }

    if (limit) {
      paginatedPostsCteQB.limit(limit);
    }

    if (offset) {
      paginatedPostsCteQB.offset(offset);
    }

    addWherePartsToQueryBuilder(paginatedPostsCteQB, whereParts);

    return { qb: paginatedPostsCteQB, alias: 'paginated_posts' };
  }

  private validateSortQueryParams(
    queryParams: GetPostsQueryParams,
  ): [string, SortDirectionSql] {
    const allowedSortFields = Object.values(PostsSortBy);
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : PostsSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return [sortBy, sortDirection];
  }
}
