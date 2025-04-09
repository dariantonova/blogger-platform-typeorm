import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async findById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return CommentViewDto.mapToView(comment);
  }

  async findPostComments(
    postId: string,
    query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter: FilterQuery<Comment> = {
      postId,
      deletedAt: null,
    };

    const comments = await this.CommentModel.find(filter)
      .sort({
        [query.sortBy]: query.sortDirection === SortDirection.Asc ? 1 : -1,
        _id: 1,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const items = comments.map(CommentViewDto.mapToView);
    const totalCount = await this.CommentModel.countDocuments(filter);

    return PaginatedViewDto.mapToView<CommentViewDto[]>({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }
}
