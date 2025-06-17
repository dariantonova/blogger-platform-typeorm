import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryWrap } from '../../../posts/infrastructure/posts.repository.wrap';
import { CommentsRepositoryWrap } from '../../infrastructure/comments.repository.wrap';
import { CommentWrap } from '../../domain/comment.wrap';
import { CreateCommentDtoSql } from '../../../../blogger-platform-sql/comments/dto/create-comment.dto.sql';

export class CreateCommentCommandWrap {
  constructor(public dto: CreateCommentDtoSql) {}
}

@CommandHandler(CreateCommentCommandWrap)
export class CreateCommentUseCaseWrap
  implements ICommandHandler<CreateCommentCommandWrap, number>
{
  constructor(
    private postsRepository: PostsRepositoryWrap,
    private commentsRepository: CommentsRepositoryWrap,
  ) {}

  async execute({ dto }: CreateCommentCommandWrap): Promise<number> {
    await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    const comment = CommentWrap.createInstance(dto);

    await this.commentsRepository.save(comment);

    return comment.id;
  }
}
