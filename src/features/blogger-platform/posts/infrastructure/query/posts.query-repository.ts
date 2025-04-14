import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { Post, PostDocument, PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  private async findByFilterAndQuery(
    filter: FilterQuery<Post>,
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostDocument[]>> {
    const posts = await this.PostModel.find(filter)
      .sort({
        [query.sortBy]: query.sortDirection === SortDirection.Asc ? 1 : -1,
        _id: 1,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    return PaginatedViewDto.mapToView<PostDocument[]>({
      items: posts,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async findPosts(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostDocument[]>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

    return this.findByFilterAndQuery(filter, query);
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findByIdOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findByIdOrInternalFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  async findBlogPosts(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostDocument[]>> {
    const filter: FilterQuery<Post> = {
      blogId,
      deletedAt: null,
    };

    return this.findByFilterAndQuery(filter, query);
  }
}
