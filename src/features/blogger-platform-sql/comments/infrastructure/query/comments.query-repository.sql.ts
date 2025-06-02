import { Injectable } from '@nestjs/common';
import { CommentsRepositorySql } from '../comments.repository.sql';
import { CommentDtoSql } from '../../dto/comment.dto.sql';

@Injectable()
export class CommentsQueryRepositorySql {
  constructor(private commentsRepository: CommentsRepositorySql) {}

  async findByIdOrInternalFail(id: number): Promise<CommentDtoSql> {
    return this.commentsRepository.findByIdOrInternalFail(id);
  }
}
