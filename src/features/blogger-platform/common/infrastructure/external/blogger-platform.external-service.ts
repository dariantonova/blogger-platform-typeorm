import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { PostLikesRepository } from '../../../likes/infrastructure/post-likes.repository';
import { CommentLikesRepository } from '../../../likes/infrastructure/comment-likes.repository';

@Injectable()
export class BloggerPlatformExternalService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postLikesRepository: PostLikesRepository,
    private commentLikesRepository: CommentLikesRepository,
  ) {}

  async deleteUserRelations(userId: number): Promise<void> {
    await this.commentLikesRepository.softDeleteLikesOfCommentsWithUserId(
      userId,
    );
    await this.commentsRepository.softDeleteByUserId(userId);
    await this.commentLikesRepository.softDeleteByUserId(userId);
    await this.postLikesRepository.softDeleteByUserId(userId);
  }
}
