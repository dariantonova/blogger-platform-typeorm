import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepo } from '../../infrastructure/query/blogs.query-repo';

export class GetBlogsQuery {
  constructor(public queryParams: GetBlogsQueryParams) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler
  implements IQueryHandler<GetBlogsQuery, PaginatedViewDto<BlogViewDto[]>>
{
  constructor(private blogsQueryRepository: BlogsQueryRepo) {}

  async execute({
    queryParams,
  }: GetBlogsQuery): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.findBlogs(queryParams);
  }
}
