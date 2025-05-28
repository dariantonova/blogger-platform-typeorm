import { GetBlogsQueryParams } from '../../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDtoSql } from '../../api/view-dto/blog.view-dto.sql';
import { BlogsQueryRepositorySql } from '../../infrastructure/query/blogs.query-repository.sql';

export class GetBlogsQuerySql {
  constructor(public queryParams: GetBlogsQueryParams) {}
}

@QueryHandler(GetBlogsQuerySql)
export class GetBlogsQueryHandlerSql
  implements IQueryHandler<GetBlogsQuerySql, PaginatedViewDto<BlogViewDtoSql[]>>
{
  constructor(private blogsQueryRepository: BlogsQueryRepositorySql) {}

  async execute({
    queryParams,
  }: GetBlogsQuerySql): Promise<PaginatedViewDto<BlogViewDtoSql[]>> {
    return this.blogsQueryRepository.findBlogs(queryParams);
  }
}
