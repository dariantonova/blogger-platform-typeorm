import { Controller, Get, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDtoSql } from './view-dto/blog.view-dto.sql';
import { GetBlogsQuerySql } from '../application/queries/get-blogs.query.sql';

@Controller('sql/blogs')
export class BlogsControllerSql {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDtoSql[]>> {
    return this.queryBus.execute(new GetBlogsQuerySql(query));
  }
}
