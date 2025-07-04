import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/blog.entity';
import { ILike, Repository } from 'typeorm';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsSortBy } from '../../api/input-dto/blogs-sort-by';

import { SortDirectionSql } from '../../../../../common/types/typeorm/sort-direction-sql';

@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
  ) {}

  async findBlogs(
    queryParams: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const orParts: any[] = [];

    if (queryParams.searchNameTerm) {
      orParts.push({ name: ILike(`%${queryParams.searchNameTerm}%`) });
    }

    const [sortBy, sortDirection] = this.validateSortQueryParams(queryParams);

    const [blogs, totalCount] = await this.blogsRepository.findAndCount({
      where: orParts,
      order: { [sortBy]: sortDirection },
      skip: queryParams.calculateSkip(),
      take: queryParams.pageSize,
    });

    const items = blogs.map(BlogViewDto.mapToViewEntity);

    return PaginatedViewDto.mapToView<BlogViewDto[]>({
      items,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  async findByIdOrInternalFail(id: number): Promise<BlogViewDto> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new InternalServerErrorException('Blog not found');
    }

    return BlogViewDto.mapToViewEntity(blog);
  }

  async findByIdOrNotFoundFail(id: number): Promise<BlogViewDto> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return BlogViewDto.mapToViewEntity(blog);
  }

  private async findById(id: number): Promise<Blog | null> {
    return this.blogsRepository.findOne({ where: { id } });
  }

  private validateSortQueryParams(
    queryParams: GetBlogsQueryParams,
  ): [string, SortDirectionSql] {
    const allowedSortFields = Object.values(BlogsSortBy);
    const sortBy = allowedSortFields.includes(queryParams.sortBy)
      ? queryParams.sortBy
      : BlogsSortBy.CreatedAt;

    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return [sortBy, sortDirection];
  }
}
