import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepositorySql } from '../../infrastructure/query/blogs.query-repository.sql';
import { BlogViewDto } from '../../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';

export class GetBlogByIdOrInternalFailQuerySql {
  constructor(public blogId: number) {}
}

@QueryHandler(GetBlogByIdOrInternalFailQuerySql)
export class GetBlogByIdOrInternalFailQueryHandlerSql
  implements IQueryHandler<GetBlogByIdOrInternalFailQuerySql, BlogViewDto>
{
  constructor(private blogsQueryRepository: BlogsQueryRepositorySql) {}

  async execute({
    blogId,
  }: GetBlogByIdOrInternalFailQuerySql): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrInternalFail(blogId);
  }
}
