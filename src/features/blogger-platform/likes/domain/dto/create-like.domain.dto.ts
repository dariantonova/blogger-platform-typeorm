import { LikeStatus } from '../../dto/like-status';

export class CreateLikeDomainDto {
  parentId: string;
  userId: string;
  status: LikeStatus;
}
