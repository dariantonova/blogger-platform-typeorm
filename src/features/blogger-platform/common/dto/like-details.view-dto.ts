import { LikeDetailsViewRow } from '../infrastructure/query/dto/like-details.view-row';

export class LikeDetailsViewDto {
  addedAt: string;
  userId: string;
  login: string;

  static mapToView(row: LikeDetailsViewRow): LikeDetailsViewDto {
    const dto = new LikeDetailsViewDto();

    dto.addedAt = new Date(row.added_at).toISOString();
    dto.userId = row.user_id.toString();
    dto.login = row.login;

    return dto;
  }
}
