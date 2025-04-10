import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CommentViewDto } from '../api/view-dto/comments.view-dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async findAllPostComments(postId: string): Promise<CommentDocument[]> {
    const filter: FilterQuery<Comment> = {
      postId,
      deletedAt: null,
    };

    return this.CommentModel.find(filter);
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findByIdOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}
