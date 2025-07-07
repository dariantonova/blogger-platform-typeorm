import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { WherePart } from '../../../../../common/types/typeorm/where-part';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { addWherePartsToQueryBuilder } from '../../../../../common/utils/typeorm/add-where-parts-to-query-builder';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentViewRow } from './dto/comment.view-row';
import { Comment } from '../../domain/comment.entity';
import { SortDirectionSql } from '../../../../../common/types/typeorm/sort-direction-sql';
import { camelCaseToSnakeCase } from '../../../../../common/utils/camel-case-to-snake-case';
import { CommentsSortBy } from '../../api/input-dto/comments-sort-by';
import { CtePart } from '../../../../../common/types/typeorm/cte-part';
import { CommentLike } from '../../../likes/domain/comment-like.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code';

@Injectable()
export class CommentsQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPostComments(
    postId: number,
    queryParams: GetCommentsQueryParams,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const whereParts: WherePart[] = [
      { expression: 'c.postId = :postId', params: { postId } },
    ];

    return this.findManyByWhereAndQuery(whereParts, queryParams, currentUserId);
  }

  async findByIdOrInternalFail(
    id: number,
    currentUserId: number | undefined,
  ): Promise<CommentViewDto> {
    const comment = await this.findById(id, currentUserId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Comment not found',
      });
    }

    return CommentViewDto.mapToView(comment);
  }

  async findByIdOrNotFoundFail(
    id: number,
    currentUserId: number | undefined,
  ): Promise<CommentViewDto> {
    const comment = await this.findById(id, currentUserId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return CommentViewDto.mapToView(comment);
  }

  private async findById(
    id: number,
    currentUserId: number | undefined,
  ): Promise<CommentViewRow | null> {
    const whereParts: WherePart[] = [
      { expression: 'c.id = :id', params: { id } },
    ];

    const queryBuilder = this.getCommentsSelectQB(currentUserId, whereParts);
    const comment = await queryBuilder.getRawOne<CommentViewRow>();

    return comment ? comment : null;
  }

  private async findManyByWhereAndQuery(
    whereParts: WherePart[],
    queryParams: GetCommentsQueryParams,
    currentUserId: number | undefined,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const [sortBy, sortDirection] = this.validateSortQueryParams(queryParams);
    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const queryBuilder = this.getCommentsSelectQB(
      currentUserId,
      whereParts,
      sortBy,
      sortDirection,
      limit,
      offset,
    );

    const commentRows = await queryBuilder.getRawMany<CommentViewRow>();
    const items = commentRows.map(CommentViewDto.mapToView);

    const countQB = this.dataSource.createQueryBuilder().from(Comment, 'c');
    addWherePartsToQueryBuilder(countQB, whereParts);
    const totalCount = await countQB.getCount();

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  private getCommentsSelectQB(
    currentUserId: number | undefined,
    whereParts: WherePart[] = [],
    sortBy?: string,
    sortDirection?: SortDirectionSql,
    limit?: number,
    offset?: number,
  ): SelectQueryBuilder<any> {
    const queryBuilder = this.dataSource.createQueryBuilder();

    const cteParts = [
      ...this.buildCommentLikesCteParts(currentUserId),
      this.buildPaginatedCommentsCtePart(
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
        'c.id as id',
        'c.content as content',
        'c.created_at as created_at',
        'c.user_id as user_id',
        'c.user_login as user_login',
        'COALESCE(clc.likes_count, 0) as likes_count',
        'COALESCE(clc.dislikes_count, 0) as dislikes_count',
        `COALESCE(cucl.status, 'None') as my_status`,
      ])
      .from('paginated_comments', 'c')
      .leftJoin('comment_likes_counts', 'clc', 'c.id = clc.comment_id')
      .leftJoin('current_user_comment_likes', 'cucl', 'c.id = cucl.comment_id');

    if (sortBy) {
      queryBuilder.orderBy(sortBy, sortDirection);
    }

    return queryBuilder;
  }

  private buildCommentLikesCteParts(
    currentUserId: number | undefined,
  ): CtePart[] {
    const commentLikesCountsCteQB = this.dataSource
      .createQueryBuilder()
      .select([
        'cl.comment_id as comment_id',
        `COUNT(*) FILTER(WHERE status = 'Like')::int as likes_count`,
        `COUNT(*) FILTER(WHERE status = 'Dislike')::int as dislikes_count`,
      ])
      .from(CommentLike, 'cl')
      .groupBy('cl.comment_id');

    const currentUserCommentLikesCteQB = this.dataSource
      .createQueryBuilder()
      .select(['cl.comment_id as comment_id', 'cl.status as status'])
      .from(CommentLike, 'cl')
      .where('cl.user_id = :userId', { userId: currentUserId ?? -1 });

    return [
      { qb: commentLikesCountsCteQB, alias: 'comment_likes_counts' },
      { qb: currentUserCommentLikesCteQB, alias: 'current_user_comment_likes' },
    ];
  }

  private buildPaginatedCommentsCtePart(
    whereParts: WherePart[],
    sortBy?: string,
    sortDirection?: SortDirectionSql,
    limit?: number,
    offset?: number,
  ): CtePart {
    const paginatedCommentsCteQB = this.dataSource
      .createQueryBuilder()
      .select([
        'c.id as id',
        'c.content as content',
        'c.created_at as created_at',
        'c.user_id as user_id',
        'u.login as user_login',
      ])
      .from(Comment, 'c')
      .leftJoin('c.user', 'u');

    if (sortBy) {
      paginatedCommentsCteQB.orderBy(sortBy, sortDirection);
    }

    if (limit) {
      paginatedCommentsCteQB.limit(limit);
    }

    if (offset) {
      paginatedCommentsCteQB.offset(offset);
    }

    addWherePartsToQueryBuilder(paginatedCommentsCteQB, whereParts);

    return { qb: paginatedCommentsCteQB, alias: 'paginated_comments' };
  }

  private validateSortQueryParams(
    queryParams: GetCommentsQueryParams,
  ): [string, SortDirectionSql] {
    const allowedSortFields = Object.values(CommentsSortBy);
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : CommentsSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return [sortBy, sortDirection];
  }
}
