import { CommentatorInfoViewDto } from './commentator-info.view-dto';
import { BaseLikesInfoViewDto } from '../../../common/dto/base-likes-info.view-dto';
import { CommentViewRow } from '../../infrastructure/query/dto/comment.view-row';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoViewDto;
  createdAt: string;
  likesInfo: BaseLikesInfoViewDto;

  static mapToViewWrap(row: CommentViewRow): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = row.id.toString();
    dto.content = row.content;
    dto.commentatorInfo = {
      userId: row.user_id.toString(),
      userLogin: row.user_login,
    };
    dto.createdAt = row.created_at.toISOString();
    dto.likesInfo = {
      likesCount: row.likes_count,
      dislikesCount: row.dislikes_count,
      myStatus: row.my_status,
    };

    return dto;
  }
}
