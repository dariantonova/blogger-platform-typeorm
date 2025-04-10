import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { UsersExternalQueryRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-query-repository';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
    private usersExternalQueryRepository: UsersExternalQueryRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ dto }: CreateCommentCommand): Promise<string> {
    await this.postsRepository.findByIdOrNotFoundFail(dto.postId);

    const user = await this.usersExternalQueryRepository.findByIdOrInternalFail(
      dto.userId,
    );

    const comment = this.CommentModel.createInstance({
      content: dto.content,
      postId: dto.postId,
      userId: dto.userId,
      userLogin: user.login,
    });

    await this.commentsRepository.save(comment);

    return comment._id.toString();
  }
}
