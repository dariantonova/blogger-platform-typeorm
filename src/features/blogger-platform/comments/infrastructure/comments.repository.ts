import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params.input-dto';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { FilterQuery } from 'mongoose';
import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';
import { InjectModel } from '@nestjs/mongoose';

export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async findPostComments(
    postId: string,
    query: GetCommentsQueryParams,
  ): Promise<CommentDocument[]> {
    const filter: FilterQuery<Comment> = {
      postId,
      deletedAt: null,
    };

    return this.CommentModel.find(filter)
      .sort({
        [query.sortBy]: query.sortDirection === SortDirection.Asc ? 1 : -1,
        _id: 1,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);
  }
}
