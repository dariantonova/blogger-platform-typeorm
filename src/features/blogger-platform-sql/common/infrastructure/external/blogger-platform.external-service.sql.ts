import { Injectable } from '@nestjs/common';
import { CommentsRepositorySql } from '../../../comments/infrastructure/comments.repository.sql';
import { PostLikesRepositorySql } from '../../../likes/infrastructure/post-likes.repository.sql';
import { CommentLikesRepositorySql } from '../../../likes/infrastructure/comment-likes.repository.sql';

@Injectable()
export class BloggerPlatformExternalServiceSql {
  constructor(
    private commentsRepository: CommentsRepositorySql,
    private postLikesRepository: PostLikesRepositorySql,
    private commentLikesRepository: CommentLikesRepositorySql,
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
