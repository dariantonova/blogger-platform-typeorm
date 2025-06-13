import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryWrap } from '../../../posts/infrastructure/posts.repository.wrap';
import { CommentsRepositoryWrap } from '../../infrastructure/comments.repository.wrap';
import { CommentWrap } from '../../domain/comment.wrap';
import { CreateCommentDto } from '../../../../blogger-platform/comments/dto/create-comment.dto';

export class CreateCommentCommandWrap {
  constructor(public dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommandWrap)
export class CreateCommentUseCaseWrap
  implements ICommandHandler<CreateCommentCommandWrap, string>
{
  constructor(
    private postsRepository: PostsRepositoryWrap,
    private commentsRepository: CommentsRepositoryWrap,
  ) {}

  async execute({ dto }: CreateCommentCommandWrap): Promise<string> {
    await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    const comment = CommentWrap.createInstance(dto);

    await this.commentsRepository.save(comment);

    return comment.id.toString();
  }
}
