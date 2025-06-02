import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MakeCommentLikeOperationDtoSql } from '../../dto/make-comment-like-operation.dto.sql';
import { CommentsRepositorySql } from '../../../comments/infrastructure/comments.repository.sql';
import { CommentLikesRepositorySql } from '../../infrastructure/comment-likes.repository.sql';

export class MakeCommentLikeOperationCommandSql {
  constructor(public dto: MakeCommentLikeOperationDtoSql) {}
}

@CommandHandler(MakeCommentLikeOperationCommandSql)
export class MakeCommentLikeOperationUseCaseSql
  implements ICommandHandler<MakeCommentLikeOperationCommandSql>
{
  constructor(
    private commentLikesRepository: CommentLikesRepositorySql,
    private commentsRepository: CommentsRepositorySql,
  ) {}

  async execute({ dto }: MakeCommentLikeOperationCommandSql): Promise<void> {
    await this.commentsRepository.findByIdOrNotFoundFail(dto.commentId);

    await this.commentLikesRepository.updateCommentLike(dto);
  }
}
