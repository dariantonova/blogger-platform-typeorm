import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findPostByIdOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.findPostById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findBlogPosts(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PostDocument[]> {
    const filter: FilterQuery<Post> = {
      blogId,
      deletedAt: null,
    };

    return this.PostModel.find(filter)
      .sort({
        [query.sortBy]: query.sortDirection === SortDirection.Asc ? 1 : -1,
        _id: 1,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);
  }
}
