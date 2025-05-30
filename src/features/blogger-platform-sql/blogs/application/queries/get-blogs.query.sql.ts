import { GetBlogsQueryParams } from '../../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogsQueryRepositorySql } from '../../infrastructure/query/blogs.query-repository.sql';
import { BlogViewDto } from '../../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';

export class GetBlogsQuerySql {
  constructor(public queryParams: GetBlogsQueryParams) {}
}

@QueryHandler(GetBlogsQuerySql)
export class GetBlogsQueryHandlerSql
  implements IQueryHandler<GetBlogsQuerySql, PaginatedViewDto<BlogViewDto[]>>
{
  constructor(private blogsQueryRepository: BlogsQueryRepositorySql) {}

  async execute({
    queryParams,
  }: GetBlogsQuerySql): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.findBlogs(queryParams);
  }
}
