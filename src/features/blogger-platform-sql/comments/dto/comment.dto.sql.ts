import { CommentatorInfoDtoSql } from './commentator-info.dto.sql';
import { BaseLikesInfoDtoSql } from '../../common/dto/base-likes-info.dto.sql';

export class CommentDtoSql {
  id: number;
  content: string;
  postId: number;
  commentatorInfo: CommentatorInfoDtoSql;
  likesInfo: BaseLikesInfoDtoSql;
  createdAt: Date;
  updatedAt: Date;
}
