import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../../comments/infrastructure/comments.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ postId }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findByIdOrNotFoundFail(postId);

    post.makeDeleted();

    await this.postsRepository.save(post);

    await this.deletePostComments(postId);
  }

  private async deletePostComments(postId: string): Promise<void> {
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
