import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { Comment } from '../../domain/comment.entity';
import { CommentsRepo } from '../../infrastructure/comments.repo';
import { PostsRepo } from '../../../posts/infrastructure/posts.repo';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, number>
{
  constructor(
    private postsRepository: PostsRepo,
    private commentsRepository: CommentsRepo,
  ) {}

  async execute({ dto }: CreateCommentCommand): Promise<number> {
    await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    const comment = Comment.createInstance(dto);

    await this.commentsRepository.save(comment);

    return comment.id;
  }
}
