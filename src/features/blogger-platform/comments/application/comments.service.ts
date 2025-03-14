import { CommentsRepository } from '../infrastructure/comments.repository';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params.input-dto';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async getPostComments(
    postId: string,
    query: GetCommentsQueryParams,
  ): Promise<CommentDocument[]> {
    await this.postsRepository.findByIdOrNotFoundFail(postId);

    return this.commentsRepository.findPostComments(postId, query);
  }

  async deletePostComments(postId: string): Promise<void> {
    const comments = await this.commentsRepository.findAllPostComments(postId);

    for (const comment of comments) {
      comment.makeDeleted();
    }

    const savePromises = comments.map((comment) =>
      this.commentsRepository.save(comment),
    );
    await Promise.all(savePromises);
  }
}
