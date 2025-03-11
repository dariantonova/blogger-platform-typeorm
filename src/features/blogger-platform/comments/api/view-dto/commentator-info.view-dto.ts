import { CommentatorInfo } from '../../domain/commentator-info.schema';

export class CommentatorInfoViewDto {
  userId: string;
  userLogin: string;

  static mapToView(commentatorInfo: CommentatorInfo): CommentatorInfoViewDto {
    const dto = new CommentatorInfoViewDto();

    dto.userId = commentatorInfo.userId;
    dto.userLogin = commentatorInfo.userLogin;

    return dto;
  }
}
