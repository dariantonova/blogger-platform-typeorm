import { CommentsRepository } from '../infrastructure/comments.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(private commentsRepository: CommentsRepository) {}

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
