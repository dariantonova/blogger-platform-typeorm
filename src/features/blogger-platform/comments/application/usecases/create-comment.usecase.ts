import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { Comment } from '../../../../typeorm/entities/blogger-platform/comment.entity';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, number>
{
  constructor(
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ dto }: CreateCommentCommand): Promise<number> {
    await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    const comment = Comment.createInstance(dto);

    await this.commentsRepository.save(comment);

    return comment.id;
  }
}
