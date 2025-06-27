import { Injectable } from '@nestjs/common';
import { CommentLikesRepo } from '../../../likes/infrastructure/comment-likes.repo';
import { CommentsRepo } from '../../../comments/infrastructure/comments.repo';
import { PostLikesRepo } from '../../../likes/infrastructure/post-likes.repo';

@Injectable()
export class BloggerPlatformExternalService {
  constructor(
    private commentsRepository: CommentsRepo,
    private postLikesRepository: PostLikesRepo,
    private commentLikesRepository: CommentLikesRepo,
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
