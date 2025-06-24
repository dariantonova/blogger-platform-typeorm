import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../../../entities/blogger-platform/blog.entity';
import { ILike, Repository } from 'typeorm';
import { GetBlogsQueryParams } from '../../../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';

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

    const [blogs, totalCount] = await this.blogsRepository.findAndCount({
      where: orParts,
      order: { [queryParams.sortBy]: queryParams.sortDirection },
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

  async findById(id: number): Promise<Blog | null> {
    return this.blogsRepository.findOne({ where: { id } });
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
}
