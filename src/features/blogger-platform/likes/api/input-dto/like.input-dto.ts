import { LikeStatus } from '../../dto/like-status';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class LikeInputDto {
  @IsEnum(LikeStatus)
  @IsNotEmpty()
  likeStatus: LikeStatus;
}
