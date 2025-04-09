import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsService } from '../../../comments/application/comments.service';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private commentsService: CommentsService,
  ) {}

  async execute({ postId }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findByIdOrNotFoundFail(postId);

    post.makeDeleted();

    await this.postsRepository.save(post);

    await this.commentsService.deletePostComments(post._id.toString());
  }
}
