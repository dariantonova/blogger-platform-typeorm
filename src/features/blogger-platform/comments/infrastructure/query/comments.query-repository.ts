import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';

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

  async countPostComments(postId: string): Promise<number> {
    return this.CommentModel.countDocuments({
      postId,
      deletedAt: null,
    });
  }
}
