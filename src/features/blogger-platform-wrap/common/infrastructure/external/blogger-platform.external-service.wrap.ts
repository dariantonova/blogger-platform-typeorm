import { Injectable } from '@nestjs/common';
import { CommentsRepositoryWrap } from '../../../comments/infrastructure/comments.repository.wrap';
import { PostLikesRepositoryWrap } from '../../../likes/infrastructure/post-likes.repository.wrap';
import { CommentLikesRepositoryWrap } from '../../../likes/infrastructure/comment-likes.repository.wrap';

@Injectable()
export class BloggerPlatformExternalServiceWrap {
  constructor(
    private commentsRepository: CommentsRepositoryWrap,
    private postLikesRepository: PostLikesRepositoryWrap,
    private commentLikesRepository: CommentLikesRepositoryWrap,
  ) {}

  async deleteUserRelations(userId: string): Promise<void> {
    await this.commentLikesRepository.softDeleteLikesOfCommentsWithUserId(
      userId,
    );
    await this.commentsRepository.softDeleteByUserId(userId);
    await this.commentLikesRepository.softDeleteByUserId(userId);
    await this.postLikesRepository.softDeleteByUserId(userId);
  }
}
