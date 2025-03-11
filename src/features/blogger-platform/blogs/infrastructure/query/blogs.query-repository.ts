import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { FilterQuery } from 'mongoose';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findBlogs(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const filter: FilterQuery<Blog> = {
      deletedAt: null,
    };

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        name: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const blogs = await this.BlogModel.find(filter)
      .sort({
        [query.sortBy]: query.sortDirection === SortDirection.Asc ? 1 : -1,
        _id: 1,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);

    const items = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView<BlogViewDto[]>({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async findBlogById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findBlogByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.findBlogById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }

  async findBlogByIdOrInternalFail(id: string): Promise<BlogViewDto> {
    const blog = await this.findBlogById(id);

    if (!blog) {
      throw new Error('Blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }
}
