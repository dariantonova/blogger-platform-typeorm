import { LikeDetails } from '../schemas/like-details.schema';

export class LikeDetailsViewDto {
  addedAt: string;
  userId: string;
  login: string;

  static mapToView(likeDetails: LikeDetails): LikeDetailsViewDto {
    const dto = new LikeDetailsViewDto();

    dto.addedAt = likeDetails.addedAt.toISOString();
    dto.userId = likeDetails.userId;
    dto.login = likeDetails.login;

    return dto;
  }
}
