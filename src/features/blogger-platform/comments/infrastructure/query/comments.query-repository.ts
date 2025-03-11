import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentDocument, CommentModelType } from '../../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { NotFoundException } from '@nestjs/common';

export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async findCommentById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findCommentByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const comment = await this.findCommentById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return CommentViewDto.mapToView(comment);
  }
}
